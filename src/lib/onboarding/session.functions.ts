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

const AnswersSchema = z.record(z.any());
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

export type OnboardingSession = {
  user_id: string;
  current_step: string;
  answers: Record<string, unknown>;
  analysis: OnboardingAnalysis | null;
  connections: Record<string, "connected" | "skipped">;
  brand: Record<string, unknown>;
  ai_training: Record<string, unknown>;
  marketing_plan: unknown;
  checklist: Record<string, boolean>;
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
  .handler(async ({ context }): Promise<OnboardingSession> => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("onboarding_sessions")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw error;
    if (data) return data as unknown as OnboardingSession;

    // Create row on first read
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

    // Read current state so we can deep-merge JSONB fields.
    const { data: current } = await supabase
      .from("onboarding_sessions")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    const merged: Record<string, unknown> = {
      user_id: userId,
      current_step: data.step ?? current?.current_step ?? "welcome",
      answers: { ...(current?.answers ?? {}), ...(data.answers ?? {}) },
      connections: { ...(current?.connections ?? {}), ...(data.connections ?? {}) },
      brand: { ...(current?.brand ?? {}), ...(data.brand ?? {}) },
      ai_training: { ...(current?.ai_training ?? {}), ...(data.ai_training ?? {}) },
      checklist: { ...(current?.checklist ?? DEFAULT_CHECKLIST), ...(data.checklist ?? {}) },
    };
    if (data.plan_tier !== undefined) merged.plan_tier = data.plan_tier;

    const { data: saved, error } = await supabase
      .from("onboarding_sessions")
      .upsert(merged, { onConflict: "user_id" })
      .select("*")
      .single();
    if (error) throw error;
    return saved as unknown as OnboardingSession;
  });

// ---------- analyzeBusiness ----------

export const analyzeBusiness = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<OnboardingAnalysis> => {
    const { supabase, userId } = context;
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const { data: session } = await supabase
      .from("onboarding_sessions")
      .select("answers")
      .eq("user_id", userId)
      .maybeSingle();
    const answers = AnswersSchema.parse(session?.answers ?? {});

    const gateway = createLovableAiGatewayProvider(key);

    const system = `You are Velora's strategist. Velora is an AI marketing operating system for non-expert business owners.
Voice contract:
- Plain English, no jargon (no CTR/ROAS/CAC unless explaining).
- Friendly, confident, never robotic.
- Concrete, personal, evidence-based.
- If information is missing, say what you'd need — never invent numbers.
- Confidence: high when answers are detailed, medium when partial, low when sparse.

You are given a business's onboarding answers. Score the business honestly and recommend Velora capabilities that will move the needle.`;

    const prompt = `Onboarding answers:
${JSON.stringify(answers, null, 2)}

Return an honest analysis. businessScore is 0-100 reflecting how set-up-for-growth this business is today.
marketingMaturity reflects their current sophistication.
growthOpportunity reflects headroom given industry, goals, current state.
timeSavedHoursPerMonth is a realistic estimate of hours Velora would save this specific business every month.
revenueOpportunityLabel is a plain-English band like "Meaningful — likely 10–25% more sales" or "Modest — mostly time savings", tailored to what they told us.
headline: one warm sentence, includes business name if given.
summary: 2 sentences on what Velora will actually DO for them.
recommendedFeatures: 3-6 Velora capabilities that matter most for THIS business, each with a plain-English reason.`;

    try {
      const { output } = await generateText({
        model: gateway("google/gemini-2.5-flash"),
        system,
        prompt,
        output: Output.object({ schema: AnalysisSchema }),
      });

      // Persist analysis
      await supabase
        .from("onboarding_sessions")
        .update({ analysis: output })
        .eq("user_id", userId);

      return output;
    } catch {
      // Deterministic fallback so the UI never crashes.
      const filled = Object.values(answers).filter(Boolean).length;
      const fallback: OnboardingAnalysis = {
        businessScore: Math.min(45 + filled * 3, 82),
        marketingMaturity: filled > 12 ? "established" : filled > 6 ? "developing" : "beginner",
        growthOpportunity: "high",
        timeSavedHoursPerMonth: 24,
        revenueOpportunityLabel: "Meaningful — most owners see a 10–25% lift once Velora is running.",
        headline:
          typeof answers.businessName === "string" && answers.businessName
            ? `Here's how Velora will work for ${answers.businessName}.`
            : "Here's how Velora will work for your business.",
        summary:
          "Velora will unify your marketing data, watch it every day, and translate what's happening into plain English with a next best action.",
        recommendedFeatures: [
          { name: "AI Assistant", reason: "Explains your numbers in plain English so you don't have to interpret charts." },
          { name: "Unified Analytics", reason: "One dashboard replaces the tabs you keep open across platforms." },
          { name: "Weekly Reports", reason: "A short briefing lands every Monday — no manual work." },
          { name: "Publishing & Scheduling", reason: "Plan a week of content in one sitting and forget it." },
        ],
        confidence: filled > 12 ? "medium" : "low",
      };
      await supabase
        .from("onboarding_sessions")
        .update({ analysis: fallback })
        .eq("user_id", userId);
      return fallback;
    }
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
