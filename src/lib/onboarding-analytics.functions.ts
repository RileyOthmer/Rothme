import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const anonId = z.string().min(8).max(128);

const eventSchema = z.object({
  anonId,
  eventType: z.enum([
    "onboarding_started",
    "step_viewed",
    "step_completed",
    "step_skipped",
    "onboarding_completed",
    "onboarding_abandoned",
  ]),
  stepId: z.string().max(60).optional().nullable(),
});

export const trackOnboardingEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => eventSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("onboarding_events").insert({
      anon_id: data.anonId,
      event_type: data.eventType,
      step_id: data.stepId ?? null,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const responseSchema = z.object({
  anonId,
  userType: z.array(z.string().max(80)).max(30).optional(),
  goals: z.array(z.string().max(80)).max(50).optional(),
  platforms: z.array(z.string().max(80)).max(50).optional(),
  cadence: z.string().max(80).nullable().optional(),
  frustrations: z.array(z.string().max(80)).max(50).optional(),
  aiFeatures: z.array(z.string().max(80)).max(50).optional(),
  connectedPlatforms: z.array(z.string().max(80)).max(50).optional(),
  country: z.string().max(4).nullable().optional(),
  timezone: z.string().max(80).nullable().optional(),
  deviceType: z.enum(["mobile", "tablet", "desktop"]).nullable().optional(),
  referralSource: z.string().max(200).nullable().optional(),
  completed: z.boolean().optional(),
});

export const upsertOnboardingResponse = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => responseSchema.parse(data))
  .handler(async ({ data, context }) => {
    const row: Record<string, unknown> = { anon_id: data.anonId };
    if (data.userType) row.user_type = data.userType;
    if (data.goals) row.goals = data.goals;
    if (data.platforms) row.platforms = data.platforms;
    if (data.cadence !== undefined) row.cadence = data.cadence;
    if (data.frustrations) row.frustrations = data.frustrations;
    if (data.aiFeatures) row.ai_features = data.aiFeatures;
    if (data.connectedPlatforms) row.connected_platforms = data.connectedPlatforms;
    if (data.country !== undefined) row.country = data.country;
    if (data.timezone !== undefined) row.timezone = data.timezone;
    if (data.deviceType !== undefined) row.device_type = data.deviceType;
    if (data.referralSource !== undefined) row.referral_source = data.referralSource;
    if (data.completed !== undefined) row.completed = data.completed;

    const { error } = await context.supabase
      .from("onboarding_responses")
      .upsert(row as never, { onConflict: "anon_id" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// -------- Insights (aggregation) --------

type Counter = { label: string; count: number };
function tally(rows: Array<{ arr: string[] | null }>): Counter[] {
  const m = new Map<string, number>();
  for (const r of rows) for (const v of r.arr ?? []) m.set(v, (m.get(v) ?? 0) + 1);
  return [...m.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}
function tallyScalar(rows: Array<{ v: string | null }>): Counter[] {
  const m = new Map<string, number>();
  for (const r of rows) {
    if (!r.v) continue;
    m.set(r.v, (m.get(r.v) ?? 0) + 1);
  }
  return [...m.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

export type OnboardingInsights = {
  totalStarts: number;
  totalCompleted: number;
  completionRate: number;
  userTypes: Counter[];
  aiFeatures: Counter[];
  platforms: Counter[];
  connectedPlatforms: Counter[];
  frustrations: Counter[];
  goals: Counter[];
  cadence: Counter[];
  devices: Counter[];
  countries: Counter[];
  referrals: Counter[];
  dropOffByStep: Array<{ stepId: string; views: number; completions: number; dropRate: number }>;
  growth: Array<{ day: string; starts: number; completions: number }>;
};

const STEP_ORDER = [
  "welcome","describe","goals","platforms","cadence","frustrations","ai","connect","loading","done",
];

export const getOnboardingInsights = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<OnboardingInsights> => {
    // Admin-only: cross-user analytics must not leak to regular users.
    const { data: roleRow, error: roleErr } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (roleErr) throw new Error(roleErr.message);
    if (!roleRow) throw new Error("Forbidden: admin only");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");


    const [{ data: responses }, { data: events }] = await Promise.all([
      supabaseAdmin.from("onboarding_responses").select("*"),
      supabaseAdmin.from("onboarding_events").select("event_type, step_id, anon_id, created_at"),
    ]);

    const rs = responses ?? [];
    const ev = events ?? [];

    const startedAnons = new Set(
      ev.filter((e: any) => e.event_type === "onboarding_started").map((e: any) => e.anon_id),
    );
    const completedAnons = new Set(
      ev.filter((e: any) => e.event_type === "onboarding_completed").map((e: any) => e.anon_id),
    );
    const totalStarts = startedAnons.size || rs.length;
    const totalCompleted = completedAnons.size || rs.filter((r: any) => r.completed).length;
    const completionRate = totalStarts > 0 ? totalCompleted / totalStarts : 0;

    // Drop-off per step
    const viewsPerStep = new Map<string, Set<string>>();
    const completesPerStep = new Map<string, Set<string>>();
    for (const e of ev as any[]) {
      if (!e.step_id) continue;
      if (e.event_type === "step_viewed") {
        if (!viewsPerStep.has(e.step_id)) viewsPerStep.set(e.step_id, new Set());
        viewsPerStep.get(e.step_id)!.add(e.anon_id);
      } else if (e.event_type === "step_completed" || e.event_type === "step_skipped") {
        if (!completesPerStep.has(e.step_id)) completesPerStep.set(e.step_id, new Set());
        completesPerStep.get(e.step_id)!.add(e.anon_id);
      }
    }
    const dropOffByStep = STEP_ORDER.filter(
      (s) => viewsPerStep.has(s) || completesPerStep.has(s),
    ).map((stepId) => {
      const views = viewsPerStep.get(stepId)?.size ?? 0;
      const completions = completesPerStep.get(stepId)?.size ?? 0;
      const dropRate = views > 0 ? Math.max(0, 1 - completions / views) : 0;
      return { stepId, views, completions, dropRate };
    });

    // Growth over time (last 30 days)
    const now = Date.now();
    const dayMs = 86_400_000;
    const growthMap = new Map<string, { starts: number; completions: number }>();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now - i * dayMs).toISOString().slice(0, 10);
      growthMap.set(d, { starts: 0, completions: 0 });
    }
    for (const e of ev as any[]) {
      const d = new Date(e.created_at).toISOString().slice(0, 10);
      const bucket = growthMap.get(d);
      if (!bucket) continue;
      if (e.event_type === "onboarding_started") bucket.starts += 1;
      if (e.event_type === "onboarding_completed") bucket.completions += 1;
    }
    const growth = [...growthMap.entries()].map(([day, v]) => ({ day, ...v }));

    return {
      totalStarts,
      totalCompleted,
      completionRate,
      userTypes: tally(rs.map((r: any) => ({ arr: r.user_type }))),
      aiFeatures: tally(rs.map((r: any) => ({ arr: r.ai_features }))),
      platforms: tally(rs.map((r: any) => ({ arr: r.platforms }))),
      connectedPlatforms: tally(rs.map((r: any) => ({ arr: r.connected_platforms }))),
      frustrations: tally(rs.map((r: any) => ({ arr: r.frustrations }))),
      goals: tally(rs.map((r: any) => ({ arr: r.goals }))),
      cadence: tallyScalar(rs.map((r: any) => ({ v: r.cadence }))),
      devices: tallyScalar(rs.map((r: any) => ({ v: r.device_type }))),
      countries: tallyScalar(rs.map((r: any) => ({ v: r.country }))),
      referrals: tallyScalar(rs.map((r: any) => ({ v: r.referral_source }))),
      dropOffByStep,
      growth,
    };
  });
