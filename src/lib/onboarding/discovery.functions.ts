/**
 * Server function that turns discovery wizard answers into a personalized
 * ROTHME recommendation. Lovable AI Gateway → structured JSON validated by
 * Zod. Follows the four-questions voice contract: plain English, evidence,
 * confidence, no jargon.
 */
import { createServerFn } from "@tanstack/react-start";
import { generateText, Output } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";


const AnswersSchema = z.object({
  businessName: z.string().optional(),
  industry: z.string().optional(),
  businessSize: z.string().optional(),
  country: z.string().optional(),
  timezone: z.string().optional(),
  experience: z.string().optional(),
  primaryGoals: z.array(z.string()).optional(),
  teamSize: z.string().optional(),
  currentTools: z.array(z.string()).optional(),
  budget: z.string().optional(),
  painPoints: z.array(z.string()).optional(),
  preferredPlatforms: z.array(z.string()).optional(),
});

const SolutionSchema = z.object({
  headline: z.string().describe("One sentence, plain English, personal — includes the business name if given."),
  summary: z.string().describe("2-3 sentences explaining how ROTHME specifically helps this business."),
  recommendedFeatures: z.array(z.object({
    name: z.string(),
    reason: z.string().describe("Why this matters for THIS business, plain English, one sentence."),
  })).min(3).max(5),
  recommendedIntegrations: z.array(z.string()).min(2).max(6),
  estimatedTimeSavedHoursPerWeek: z.number().min(1).max(40),
  firstThreeActions: z.array(z.string()).min(3).max(3).describe("The first three concrete things ROTHME would do for this business, in order."),
  confidence: z.enum(["high", "medium", "low"]),
});

export type PersonalizedSolution = z.infer<typeof SolutionSchema>;

export const generatePersonalizedSolution = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => AnswersSchema.parse(input))
  .handler(async ({ data }): Promise<PersonalizedSolution> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const gateway = createLovableAiGatewayProvider(key);

    const system = `You are ROTHME's strategist. ROTHME is an AI marketing operating system for non-expert business owners.
Voice contract:
- Plain English, no jargon (no CTR/ROAS/CAC unless explaining).
- Friendly, confident, never robotic.
- Concrete, personal, evidence-based.
- If information is missing, say what you'd need — never invent numbers.
- Confidence is your honest self-assessment: high when the answers are detailed and specific, medium when partial, low when sparse.

You are given wizard answers from a prospective customer. Return a personalized recommendation.`;

    const prompt = `Wizard answers (JSON):
${JSON.stringify(data, null, 2)}

Recommend which ROTHME capabilities matter MOST for this business and why. Available capabilities:
- AI Assistant (plain-English explanations of what's working)
- Unified Analytics (one dashboard across every platform)
- Publishing & Scheduling (write once, post everywhere)
- Automation (rules, alerts, done-for-you actions)
- Weekly Reports (auto-generated, plain English)
- CRM (customer memory across channels)
- Team Collaboration (approvals, comments, roles)
- Developer Center (custom integrations)

Available integrations: Instagram, Facebook, TikTok, LinkedIn, YouTube, X, Pinterest, Threads, Google Business Profile, Google Analytics, Google Ads, Meta Ads, Shopify, Mailchimp.

Pick 3-5 recommended features and 2-6 integrations that fit THIS business.`;

    try {
      const { output } = await generateText({
        model: gateway("google/gemini-2.5-flash"),
        system,
        prompt,
        output: Output.object({ schema: SolutionSchema }),
      });
      return output;
    } catch (err) {
      // Fallback: deterministic, personalized-lite response so the UI never crashes
      const goals = data.primaryGoals ?? [];
      const platforms = data.preferredPlatforms ?? [];
      return {
        headline: data.businessName
          ? `Here's how ROTHME would work for ${data.businessName}.`
          : "Here's how ROTHME would work for your business.",
        summary:
          "Based on your answers, ROTHME will pull your marketing into one place, watch it every day, and tell you in plain English what's working and what to do next.",
        recommendedFeatures: [
          { name: "AI Assistant", reason: "Explains your numbers in plain English so you don't have to interpret charts." },
          { name: "Unified Analytics", reason: "One dashboard replaces the tabs you keep open across platforms." },
          { name: "Weekly Reports", reason: "A short briefing lands every Monday — no manual work." },
          ...(goals.includes("Post more consistently")
            ? [{ name: "Publishing & Scheduling", reason: "Plan a week of content in one sitting and forget it." }]
            : []),
        ].slice(0, 5),
        recommendedIntegrations: (platforms.length ? platforms : ["Instagram", "Facebook", "Google Analytics"]).slice(0, 6),
        estimatedTimeSavedHoursPerWeek: 6,
        firstThreeActions: [
          "Connect your top marketing account (2 minutes).",
          "Get your first plain-English morning brief within 24 hours.",
          "Pick one recommended action and let ROTHME do it for you.",
        ],
        confidence: Object.values(data).filter(Boolean).length >= 6 ? "medium" : "low",
      };
    }
  });
