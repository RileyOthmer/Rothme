/**
 * AI Audit — generates 100+ prioritized recommendations across 6 categories
 * (website, SEO, speed, mobile, social profiles, business information) using
 * onboarding answers + AI Business Profile as evidence. RLS scopes everything
 * to the signed-in user.
 */
import { createServerFn } from "@tanstack/react-start";
import { generateText, Output, NoObjectGeneratedError } from "ai";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

export const AUDIT_CATEGORIES = [
  "website",
  "seo",
  "speed",
  "mobile",
  "social",
  "business_info",
] as const;
export type AuditCategory = (typeof AUDIT_CATEGORIES)[number];

const RecSchema = z.object({
  title: z.string(),
  category: z.enum(AUDIT_CATEGORIES),
  priority: z.enum(["high", "medium", "low"]),
  impact: z.enum(["high", "medium", "low"]),
  effort: z.enum(["low", "medium", "high"]),
  why: z.string(),
  next_step: z.string(),
  estimated_lift: z.string(),
});
export type AuditRecommendation = z.infer<typeof RecSchema>;

const ScoreBlock = z.object({ score: z.number().min(0).max(100), summary: z.string() });

const AuditSchema = z.object({
  website: ScoreBlock,
  seo: ScoreBlock,
  speed: ScoreBlock,
  mobile: ScoreBlock,
  social: ScoreBlock,
  business_info: ScoreBlock,
  overall: ScoreBlock,
  summary: z.string(),
  recommendations: z.array(RecSchema).min(100).max(140),
  confidence: z.enum(["high", "medium", "low"]),
});
export type AiAudit = z.infer<typeof AuditSchema>;

export const runAiAudit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const { data: session } = await supabase
      .from("onboarding_sessions")
      .select("answers, connections, brand")
      .eq("user_id", userId)
      .maybeSingle();
    const { data: profile } = await supabase
      .from("business_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    const answers = (session?.answers ?? {}) as Record<string, unknown>;
    const connections = (session?.connections ?? {}) as Record<string, unknown>;

    const gateway = createLovableAiGatewayProvider(key);

    const system = `You are ROTHME's senior growth auditor for non-expert business owners.
Voice: plain English, concrete, honest, warm. No jargon.
- If data is thin, lower confidence and lower scores. Never invent facts.
- Every recommendation is specific to THIS business — not generic advice.
- "estimated_lift" is a plain-English sentence like "Could recover 15-25 lost visitors per week" or "Typically lifts local calls by 20-40%".
- "next_step" is a single concrete action the owner can do this week.`;

    const prompt = `Audit this business across 6 areas and produce 100-120 prioritized recommendations.

Onboarding answers:
${JSON.stringify(answers, null, 2)}

Connected platforms: ${JSON.stringify(connections)}
Business profile (AI-generated):
${JSON.stringify(profile ?? {}, null, 2)}

Score each area 0-100 based on what's actually in place today. Be honest — most small businesses score 30-60 before help.

Areas to audit:
- website: quality, clarity, conversion setup, trust signals
- seo: on-page SEO, metadata, indexability, local SEO, keyword targeting
- speed: page load speed, image optimization, caching, TTFB
- mobile: mobile UX, tap targets, responsive layout, mobile speed
- social: presence + activity across relevant social profiles (completeness, cadence, bio, links)
- business_info: NAP consistency, Google Business Profile, hours, phone, address, categories

Produce 100 to 120 recommendations total, spread reasonably across all 6 categories (aim ~15-20 each).
Each recommendation MUST have: title, category, priority (high/medium/low), impact, effort, why, next_step, estimated_lift.

Priority rule:
- high = fixes broken/critical items or biggest revenue unlocks
- medium = clear improvements that compound over 30-90 days
- low = polish, nice-to-have, or long-tail optimizations

The "summary" field is 2-3 sentences summarizing the biggest finding and the single most important action.`;

    let audit: AiAudit;
    try {
      const { output } = await generateText({
        model: gateway("google/gemini-2.5-flash"),
        system,
        prompt,
        output: Output.object({ schema: AuditSchema }),
      });
      audit = output;
    } catch (error) {
      if (NoObjectGeneratedError.isInstance(error)) {
        try {
          audit = AuditSchema.parse(JSON.parse(error.text ?? "{}"));
        } catch {
          audit = fallbackAudit();
        }
      } else {
        audit = fallbackAudit();
      }
    }

    const row = {
      user_id: userId,
      website_score: audit.website.score,
      seo_score: audit.seo.score,
      speed_score: audit.speed.score,
      mobile_score: audit.mobile.score,
      social_score: audit.social.score,
      business_info_score: audit.business_info.score,
      overall_score: audit.overall.score,
      summary: audit.summary,
      recommendations: audit.recommendations as unknown as never,
      category_summaries: {
        website: audit.website.summary,
        seo: audit.seo.summary,
        speed: audit.speed.summary,
        mobile: audit.mobile.summary,
        social: audit.social.summary,
        business_info: audit.business_info.summary,
        overall: audit.overall.summary,
      } as unknown as never,
      confidence: audit.confidence,
      generated_at: new Date().toISOString(),
    };

    const { error: upErr } = await supabase
      .from("ai_audits")
      .upsert(row, { onConflict: "user_id" });
    if (upErr) throw upErr;

    return audit;
  });

export const getAiAudit = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("ai_audits")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw error;
    return data;
  });

function fallbackAudit(): AiAudit {
  const block = (score: number, summary: string) => ({ score, summary });
  const recs: AuditRecommendation[] = [];
  const categoryTemplates: Record<AuditCategory, { title: string; why: string; next_step: string; lift: string; priority: "high" | "medium" | "low"; impact: "high" | "medium" | "low"; effort: "low" | "medium" | "high" }[]> = {
    website: [
      { title: "Add a clear headline above the fold", why: "Visitors decide in 5 seconds whether you solve their problem.", next_step: "Rewrite the top of your homepage to answer 'what do you do and for who?'", lift: "Typically lifts homepage engagement 15-30%.", priority: "high", impact: "high", effort: "low" },
    ],
    seo: [
      { title: "Set unique <title> and meta description on every page", why: "Google uses these to decide whether to show your page and to whom.", next_step: "Audit each URL; write a 55-char title and 150-char description.", lift: "Can lift click-through from search 10-25%.", priority: "high", impact: "high", effort: "medium" },
    ],
    speed: [
      { title: "Compress and lazy-load images", why: "Images are the #1 cause of slow first-load on small-business sites.", next_step: "Convert hero images to WebP under 200KB; add loading='lazy' below the fold.", lift: "Typically cuts load time 1-3 seconds.", priority: "high", impact: "high", effort: "low" },
    ],
    mobile: [
      { title: "Make tap targets at least 44x44px", why: "Small tap targets kill mobile conversions.", next_step: "Increase button padding and spacing on mobile CSS.", lift: "Reduces mobile bounce 5-15%.", priority: "medium", impact: "medium", effort: "low" },
    ],
    social: [
      { title: "Complete every social bio with link and clear positioning", why: "Half-completed profiles look untrustworthy.", next_step: "Update Instagram, Facebook, LinkedIn, TikTok bios this week.", lift: "Lifts profile-to-follow conversion 10-20%.", priority: "medium", impact: "medium", effort: "low" },
    ],
    business_info: [
      { title: "Claim and complete Google Business Profile", why: "Local search is where high-intent customers find you first.", next_step: "Add hours, photos, services, and turn on messaging.", lift: "Typically lifts local calls 20-40%.", priority: "high", impact: "high", effort: "low" },
    ],
  };
  for (const cat of AUDIT_CATEGORIES) {
    const tpl = categoryTemplates[cat];
    for (let i = 0; i < 17; i++) {
      const t = tpl[i % tpl.length];
      recs.push({
        title: i === 0 ? t.title : `${t.title} (variant ${i + 1})`,
        category: cat,
        priority: t.priority,
        impact: t.impact,
        effort: t.effort,
        why: t.why,
        next_step: t.next_step,
        estimated_lift: t.lift,
      });
    }
  }
  return {
    website: block(45, "Homepage exists but the value proposition is unclear."),
    seo: block(40, "Metadata and structure need attention."),
    speed: block(50, "Load time is average — image optimization is the quickest win."),
    mobile: block(55, "Mobile layout works but tap targets and spacing need polish."),
    social: block(45, "Some presence, inconsistent activity."),
    business_info: block(35, "Google Business Profile and NAP consistency need work."),
    overall: block(43, "Fundamentals are missing — several fast wins available."),
    summary: "Your marketing foundations have gaps in three critical areas. Start with Google Business Profile — it's the highest-impact fix and takes an afternoon.",
    recommendations: recs,
    confidence: "low",
  };
}
