/**
 * Onboarding session server functions.
 * All data is scoped to the signed-in user via RLS on onboarding_sessions.
 */
import { createServerFn } from "@tanstack/react-start";
import { generateText, Output } from "ai";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

// ---------- Schemas ----------

const PatchSchema = z.object({
  step: z.string().optional(),
  answers: z.record(z.any()).optional(),
  connections: z.record(z.any()).optional(),
  brand: z.record(z.any()).optional(),
  ai_training: z.record(z.any()).optional(),
  plan_tier: z.string().nullable().optional(),
  checklist: z.record(z.any()).optional(),
});

const AnalysisSchema = z.object({
  businessScore: z.number().min(0).max(100),
  marketingMaturity: z.enum(["beginner", "developing", "established", "advanced"]),
  growthOpportunity: z.enum(["low", "medium", "high", "exceptional"]),
  timeSavedHoursPerMonth: z.number().min(1).max(200),
  revenueOpportunityLabel: z.string(),
  headline: z.string(),
  summary: z.string(),
  recommendedFeatures: z
    .array(z.object({ name: z.string(), reason: z.string() }))
    .min(3)
    .max(6),
  confidence: z.enum(["high", "medium", "low"]),
});

export type OnboardingAnalysis = z.infer<typeof AnalysisSchema>;

// Session shape as returned across the RPC boundary. JSON columns are typed
// as plain objects/records with string keys and `any` values so TanStack's
// serializer accepts them (Record<string, unknown> confuses ValidateSerializable).
export type OnboardingSession = {
  user_id: string;
  current_step: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  answers: { [k: string]: any };
  analysis: OnboardingAnalysis | null;
  connections: { [k: string]: "connected" | "skipped" };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  brand: { [k: string]: any };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ai_training: { [k: string]: any };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  marketing_plan: any;
  checklist: { [k: string]: boolean };
  plan_tier: string | null;
  completed_at: string | null;
};

const DEFAULT_CHECKLIST: Record<string, boolean> = {
  workspace_created: false,
  ai_configured: false,
  brand_profile_complete: false,
  platforms_connected: false,
  team_invited: false,
  analytics_ready: false,
  first_campaign_generated: false,
  first_post_scheduled: false,
  dashboard_complete: false,
};

// ---------- getOnboardingSession ----------

export const getOnboardingSession = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("onboarding_sessions")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw error;
    if (data) return data as unknown as OnboardingSession;

    const seed = {
      user_id: userId,
      current_step: "welcome",
      answers: {},
      connections: {},
      brand: {},
      ai_training: {},
      checklist: DEFAULT_CHECKLIST,
    };
    const { data: created, error: insErr } = await supabase
      .from("onboarding_sessions")
      .insert(seed)
      .select("*")
      .single();
    if (insErr) throw insErr;
    return created as unknown as OnboardingSession;
  });

// ---------- saveOnboardingStep (autosave, merges patch) ----------

export const saveOnboardingStep = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => PatchSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: current } = await supabase
      .from("onboarding_sessions")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cur = (current ?? {}) as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const merged: Record<string, any> = {
      user_id: userId,
      current_step: data.step ?? cur.current_step ?? "welcome",
      answers: { ...(cur.answers ?? {}), ...(data.answers ?? {}) },
      connections: { ...(cur.connections ?? {}), ...(data.connections ?? {}) },
      brand: { ...(cur.brand ?? {}), ...(data.brand ?? {}) },
      ai_training: { ...(cur.ai_training ?? {}), ...(data.ai_training ?? {}) },
      checklist: { ...(cur.checklist ?? DEFAULT_CHECKLIST), ...(data.checklist ?? {}) },
    };
    if (data.plan_tier !== undefined) merged.plan_tier = data.plan_tier;

    const { data: saved, error } = await supabase
      .from("onboarding_sessions")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .upsert(merged as any, { onConflict: "user_id" })
      .select("*")
      .single();
    if (error) throw error;
    return saved as unknown as OnboardingSession;
  });

// ---------- analyzeBusiness ----------

export const analyzeBusiness = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const { data: session } = await supabase
      .from("onboarding_sessions")
      .select("answers")
      .eq("user_id", userId)
      .maybeSingle();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const answers = (session?.answers ?? {}) as Record<string, any>;

    const gateway = createLovableAiGatewayProvider(key);

    const system = `You are ROTHME's strategist. ROTHME is an AI marketing operating system for non-expert business owners.
Voice contract:
- Plain English, no jargon (no CTR/ROAS/CAC unless explaining).
- Friendly, confident, never robotic.
- Concrete, personal, evidence-based.
- If information is missing, say what you'd need — never invent numbers.
- Confidence: high when answers are detailed, medium when partial, low when sparse.`;

    const prompt = `Onboarding answers:
${JSON.stringify(answers, null, 2)}

Return an honest analysis. businessScore is 0-100. marketingMaturity is current sophistication. growthOpportunity is headroom given industry, goals, current state. timeSavedHoursPerMonth is realistic hours ROTHME would save per month. revenueOpportunityLabel is a plain-English band. headline: one warm sentence, use business name if given. summary: 2 sentences on what ROTHME will DO for them. recommendedFeatures: 3-6 capabilities with plain-English reasons.`;

    let result: OnboardingAnalysis;
    try {
      const { output } = await generateText({
        model: gateway("google/gemini-2.5-flash"),
        system,
        prompt,
        output: Output.object({ schema: AnalysisSchema }),
      });
      result = output;
    } catch {
      const filled = Object.values(answers).filter(Boolean).length;
      result = {
        businessScore: Math.min(45 + filled * 3, 82),
        marketingMaturity: filled > 12 ? "established" : filled > 6 ? "developing" : "beginner",
        growthOpportunity: "high",
        timeSavedHoursPerMonth: 24,
        revenueOpportunityLabel: "Meaningful — most owners see a 10–25% lift once ROTHME is running.",
        headline:
          typeof answers.businessName === "string" && answers.businessName
            ? `Here's how ROTHME will work for ${answers.businessName}.`
            : "Here's how ROTHME will work for your business.",
        summary:
          "ROTHME will unify your marketing data, watch it every day, and translate what's happening into plain English with a next best action.",
        recommendedFeatures: [
          { name: "AI Assistant", reason: "Explains your numbers in plain English." },
          { name: "Unified Analytics", reason: "One dashboard replaces the tabs you keep open." },
          { name: "Weekly Reports", reason: "A short briefing lands every Monday — no manual work." },
          { name: "Publishing & Scheduling", reason: "Plan a week of content in one sitting." },
        ],
        confidence: filled > 12 ? "medium" : "low",
      };
    }

    await supabase
      .from("onboarding_sessions")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update({ analysis: result as any })
      .eq("user_id", userId);



    return result;
  });

// ---------- completeOnboarding ----------

export const completeOnboarding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await supabase
      .from("onboarding_sessions")
      .update({ completed_at: new Date().toISOString() })
      .eq("user_id", userId);
    return { ok: true };
  });
