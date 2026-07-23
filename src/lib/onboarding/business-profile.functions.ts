/**
 * Generate an AI Business Profile from onboarding answers and persist it.
 * RLS-scoped to the signed-in user via business_profiles policies.
 */
import { createServerFn } from "@tanstack/react-start";
import { generateText, Output, NoObjectGeneratedError } from "ai";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createOpenAiProvider } from "@/lib/ai-gateway.server";

const ChannelSchema = z.object({
  channel: z.string(),
  why: z.string(),
  priority: z.enum(["high", "medium", "low"]),
});

const OpportunitySchema = z.object({
  title: z.string(),
  impact: z.enum(["high", "medium", "low"]),
  effort: z.enum(["low", "medium", "high"]),
  description: z.string(),
});

const ProfileSchema = z.object({
  businessSummary: z.string(),
  idealCustomerProfile: z.object({
    who: z.string(),
    demographics: z.string(),
    painPoints: z.array(z.string()),
    buyingTriggers: z.array(z.string()),
  }),
  recommendedChannels: z.array(ChannelSchema),
  strengthScore: z.number().min(0).max(100),
  weaknessScore: z.number().min(0).max(100),
  topOpportunities: z.array(OpportunitySchema),
  swot: z.object({
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
    opportunities: z.array(z.string()),
    threats: z.array(z.string()),
  }),
  recommendedMonthlyBudget: z.object({
    low: z.number(),
    high: z.number(),
    currency: z.string(),
    rationale: z.string(),
  }),
  growthPotential: z.object({
    band: z.enum(["low", "medium", "high", "exceptional"]),
    twelveMonthLabel: z.string(),
    rationale: z.string(),
  }),
  confidence: z.enum(["high", "medium", "low"]),
});

export type BusinessProfile = z.infer<typeof ProfileSchema>;

export const generateBusinessProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new Error("Missing OPENAI_API_KEY");

    const { data: session } = await supabase
      .from("onboarding_sessions")
      .select("answers, connections, brand, ai_training")
      .eq("user_id", userId)
      .maybeSingle();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const answers = (session?.answers ?? {}) as Record<string, any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const connections = (session?.connections ?? {}) as Record<string, any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const brand = (session?.brand ?? {}) as Record<string, any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const aiTraining = (session?.ai_training ?? {}) as Record<string, any>;

    const gateway = createOpenAiProvider(key);

    const system = `You are ROTHME's senior marketing strategist for non-expert business owners.
Voice:
- Plain English. No jargon (no CTR/ROAS/CAC unless you explain them).
- Concrete, specific to their business — never generic filler.
- Confident, warm, honest. If data is sparse, say so and give lower confidence.
- Never invent numbers. Budgets and growth bands must be reasonable for the business type and location.
- Exactly 10 items in topOpportunities. 3-6 recommended channels.`;

    const prompt = `Onboarding answers:
${JSON.stringify(answers, null, 2)}

Connections status: ${JSON.stringify(connections)}
Brand: ${JSON.stringify(brand)}
AI training: ${JSON.stringify(aiTraining)}

Generate a complete AI Business Profile:
- businessSummary: 3-4 sentences describing what the business does, who it serves, and its current marketing posture.
- idealCustomerProfile: who they should target (demographics, pain points that make them buy, buying triggers).
- recommendedChannels: 3-6 marketing channels tailored to this business (e.g. "Local SEO", "Instagram Reels", "Google Ads — Local Services"). Explain why each fits.
- strengthScore (0-100): overall marketing strength today given what they have set up.
- weaknessScore (0-100): overall marketing weakness/gaps today. (Not necessarily 100 - strength.)
- topOpportunities: EXACTLY 10 concrete growth moves prioritized by impact and effort.
- swot: 3-5 items per quadrant, specific to this business.
- recommendedMonthlyBudget: realistic monthly marketing budget range in their currency (default USD). Include a short rationale.
- growthPotential: 12-month band + a plain-English label like "2-3x current revenue" and rationale.
- confidence: high if answers are detailed, low if sparse.`;

    let profile: BusinessProfile;
    try {
      const { output } = await generateText({
        model: gateway("gpt-4o-mini"),
        system,
        prompt,
        output: Output.object({ schema: ProfileSchema }),
      });
      profile = output;
    } catch (error) {
      if (NoObjectGeneratedError.isInstance(error)) {
        try {
          profile = ProfileSchema.parse(JSON.parse(error.text ?? "{}"));
        } catch {
          profile = fallbackProfile(answers);
        }
      } else {
        profile = fallbackProfile(answers);
      }
    }

    const row = {
      user_id: userId,
      business_summary: profile.businessSummary,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ideal_customer_profile: profile.idealCustomerProfile as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recommended_channels: profile.recommendedChannels as any,
      strength_score: profile.strengthScore,
      weakness_score: profile.weaknessScore,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      top_opportunities: profile.topOpportunities as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      swot: profile.swot as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recommended_monthly_budget: profile.recommendedMonthlyBudget as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      growth_potential: profile.growthPotential as any,
      confidence: profile.confidence,
      generated_at: new Date().toISOString(),
    };

    const { error: upErr } = await supabase
      .from("business_profiles")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .upsert(row as any, { onConflict: "user_id" });
    if (upErr) throw upErr;

    return profile;
  });

export const getBusinessProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("business_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw error;
    return data;
  });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fallbackProfile(answers: Record<string, any>): BusinessProfile {
  const name =
    (typeof answers.businessName === "string" && answers.businessName) || "your business";
  return {
    businessSummary: `${name} is getting its marketing foundation in place. We'll unify data, publish consistently, and translate results into plain English so you always know the next best move.`,
    idealCustomerProfile: {
      who: "Local customers who value trust and convenience.",
      demographics: "Adults 25-55 within your service area.",
      painPoints: ["Don't know who to trust", "Short on time", "Wants clear pricing"],
      buyingTriggers: ["Needs a quick solution", "Sees a strong review", "Referral from a friend"],
    },
    recommendedChannels: [
      { channel: "Local SEO (Google Business Profile)", why: "Highest-intent local buyers search Google first.", priority: "high" },
      { channel: "Instagram", why: "Shows your work and builds trust before someone calls.", priority: "high" },
      { channel: "Email newsletter", why: "Free, owned channel that keeps past customers coming back.", priority: "medium" },
    ],
    strengthScore: 45,
    weaknessScore: 55,
    topOpportunities: Array.from({ length: 10 }, (_, i) => ({
      title: `Opportunity ${i + 1}`,
      impact: (i < 3 ? "high" : i < 7 ? "medium" : "low") as "high" | "medium" | "low",
      effort: (i % 3 === 0 ? "low" : i % 3 === 1 ? "medium" : "high") as "low" | "medium" | "high",
      description: "We'll refine this once you connect your platforms.",
    })),
    swot: {
      strengths: ["Clear service offering", "Local presence"],
      weaknesses: ["Inconsistent posting", "No unified analytics"],
      opportunities: ["Local SEO", "Reviews flywheel", "Content repurposing"],
      threats: ["Competitors with bigger budgets", "Platform algorithm changes"],
    },
    recommendedMonthlyBudget: {
      low: 500,
      high: 2000,
      currency: "USD",
      rationale: "A starter budget for a local business — most goes to Google Ads and boosted social.",
    },
    growthPotential: {
      band: "high",
      twelveMonthLabel: "1.5-2x current revenue within 12 months",
      rationale: "Fundamentals are missing — closing those gaps typically produces the fastest gains.",
    },
    confidence: "low",
  };
}
