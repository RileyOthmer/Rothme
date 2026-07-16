/**
 * Generate the dashboard scorecards + personalized recommendations from
 * onboarding answers and the AI Business Profile. RLS scopes reads/writes
 * to the signed-in user.
 */
import { createServerFn } from "@tanstack/react-start";
import { generateText, Output, NoObjectGeneratedError } from "ai";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const ScoreBlock = z.object({
  score: z.number().min(0).max(100),
  summary: z.string(),
});

const RecommendationSchema = z.object({
  title: z.string(),
  category: z.enum([
    "marketing",
    "seo",
    "website",
    "social",
    "leads",
    "paid",
    "general",
  ]),
  impact: z.enum(["high", "medium", "low"]),
  effort: z.enum(["low", "medium", "high"]),
  reason: z.string(),
  nextStep: z.string(),
});

const InsightsSchema = z.object({
  marketing: ScoreBlock,
  seo: ScoreBlock,
  website: ScoreBlock,
  socialPresence: ScoreBlock,
  leadGeneration: ScoreBlock,
  paidAdvertising: ScoreBlock,
  overallHealth: ScoreBlock,
  recommendations: z.array(RecommendationSchema),
  confidence: z.enum(["high", "medium", "low"]),
});

export type DashboardInsights = z.infer<typeof InsightsSchema>;

export const generateDashboardInsights = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const { data: session } = await supabase
      .from("onboarding_sessions")
      .select("answers, connections")
      .eq("user_id", userId)
      .maybeSingle();
    const { data: profile } = await supabase
      .from("business_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const answers = (session?.answers ?? {}) as Record<string, any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const connections = (session?.connections ?? {}) as Record<string, any>;

    const gateway = createLovableAiGatewayProvider(key);

    const system = `You are ROTHME's senior marketing strategist for non-expert business owners.
Voice:
- Plain English. No jargon. Concrete. Warm.
- Honest. If data is thin, give lower scores and lower confidence — never invent.
- Every summary is ONE sentence explaining WHY the score is what it is.
- Recommendations must be specific to this business, not generic tips.
- 5-8 recommendations total, prioritized by impact then effort.`;

    const prompt = `Onboarding answers:
${JSON.stringify(answers, null, 2)}

Connections status: ${JSON.stringify(connections)}
Business profile: ${JSON.stringify(profile ?? {}, null, 2)}

Score each area 0-100 based on what's actually in place today. Be honest — most small businesses score 30-60 without help. Areas:
- marketing: overall marketing execution (posting cadence, consistency, message clarity).
- seo: search visibility (Google Business Profile, website SEO, reviews).
- website: website quality, speed, clarity, conversion setup.
- socialPresence: presence + activity on the platforms that matter for this business.
- leadGeneration: how well they capture and nurture leads (forms, email list, follow-up).
- paidAdvertising: paid ads maturity (running ads? tracking? ROAS understanding?).
- overallHealth: weighted overall — not just an average, weight by what matters most for this business type.

Then produce 5-8 personalized recommendations that would most move these scores up.`;

    let insights: DashboardInsights;
    try {
      const { output } = await generateText({
        model: gateway("google/gemini-2.5-flash"),
        system,
        prompt,
        output: Output.object({ schema: InsightsSchema }),
      });
      insights = output;
    } catch (error) {
      if (NoObjectGeneratedError.isInstance(error)) {
        try {
          insights = InsightsSchema.parse(JSON.parse(error.text ?? "{}"));
        } catch {
          insights = fallbackInsights(answers);
        }
      } else {
        insights = fallbackInsights(answers);
      }
    }

    const row = {
      user_id: userId,
      marketing_score: insights.marketing.score,
      marketing_summary: insights.marketing.summary,
      seo_score: insights.seo.score,
      seo_summary: insights.seo.summary,
      website_score: insights.website.score,
      website_summary: insights.website.summary,
      social_presence_score: insights.socialPresence.score,
      social_presence_summary: insights.socialPresence.summary,
      lead_generation_score: insights.leadGeneration.score,
      lead_generation_summary: insights.leadGeneration.summary,
      paid_advertising_score: insights.paidAdvertising.score,
      paid_advertising_summary: insights.paidAdvertising.summary,
      overall_health_score: insights.overallHealth.score,
      overall_health_summary: insights.overallHealth.summary,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recommendations: insights.recommendations as any,
      confidence: insights.confidence,
      generated_at: new Date().toISOString(),
    };

    const { error: upErr } = await supabase
      .from("dashboard_insights")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .upsert(row as any, { onConflict: "user_id" });
    if (upErr) throw upErr;

    return insights;
  });

export const getDashboardInsights = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("dashboard_insights")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw error;
    return data;
  });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fallbackInsights(_answers: Record<string, any>): DashboardInsights {
  const block = (score: number, summary: string) => ({ score, summary });
  return {
    marketing: block(45, "You're posting, but not on a consistent cadence yet."),
    seo: block(40, "Google Business Profile and website basics need attention."),
    website: block(50, "Site is live but conversion paths aren't clear."),
    socialPresence: block(48, "Some presence, low activity on the platforms that matter most."),
    leadGeneration: block(35, "No lead capture or nurture in place yet."),
    paidAdvertising: block(25, "No paid ads running — big untapped channel."),
    overallHealth: block(42, "Fundamentals are missing — quick wins are available."),
    recommendations: [
      {
        title: "Claim and complete your Google Business Profile",
        category: "seo",
        impact: "high",
        effort: "low",
        reason: "Local search is where high-intent customers find you first.",
        nextStep: "Add hours, photos, services, and turn on messaging.",
      },
      {
        title: "Set a weekly posting cadence",
        category: "social",
        impact: "high",
        effort: "medium",
        reason: "Consistency beats volume — algorithms and customers both reward it.",
        nextStep: "Plan 3 posts/week for your top channel and schedule them here.",
      },
      {
        title: "Add a simple lead capture to your website",
        category: "leads",
        impact: "high",
        effort: "low",
        reason: "You're paying to send visitors that leave without a way to follow up.",
        nextStep: "Add a short 'get a quote' form above the fold.",
      },
    ],
    confidence: "low",
  };
}
