/**
 * Quick Actions — premium action cards on the dashboard.
 * Each card opens the global AI Marketing Assistant (Command Bar) with a
 * preconfigured prompt. All generation flows through the same /api/chat
 * engine — no duplicated logic.
 */

export const ASK_AI_EVENT = "rothme:ask-ai";

export type AskAIPayload = {
  prompt: string;
  source?: string;
};

export function askAI(payload: AskAIPayload) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<AskAIPayload>(ASK_AI_EVENT, { detail: payload }));
}

export type QuickActionIcon =
  | "strategy"
  | "website"
  | "social"
  | "email"
  | "google-ads"
  | "facebook"
  | "landing"
  | "audit";

export type QuickAction = {
  id: string;
  label: string;
  description: string;
  prompt: string;
  icon: QuickActionIcon;
};

export const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "marketing-strategy",
    label: "Create Marketing Strategy",
    description: "A 90-day plan tailored to my business and goals.",
    icon: "strategy",
    prompt:
      "Act as my Chief Marketing Officer. Build a 90-day marketing strategy for my business. Include: positioning, target audience, top 3 channels with rationale, monthly milestones, budget guidance, and the KPIs we should track. Ask me for anything missing about the business.",
  },
  {
    id: "analyze-website",
    label: "Analyze My Website",
    description: "Conversion, SEO, and UX audit with fixes.",
    icon: "website",
    prompt:
      "Analyze my website like a senior CRO + SEO consultant. Cover: first-impression, value proposition clarity, conversion path, technical SEO signals, on-page SEO, mobile UX, and 5 prioritized fixes ranked by impact vs effort. Ask me for the URL if I haven't given it.",
  },
  {
    id: "social-content",
    label: "Generate Social Content",
    description: "A week of ready-to-review posts across channels.",
    icon: "social",
    prompt:
      "Generate a week of social media content across my active channels. For each post: platform, hook, caption in my brand voice, hashtags, and image/video direction. Keep it realistic — one post per channel per day, aligned to my goals.",
  },
  {
    id: "email-campaign",
    label: "Create Email Campaign",
    description: "Subject lines, body, and CTAs for a full sequence.",
    icon: "email",
    prompt:
      "Draft a 4-email marketing campaign I can review before sending. For each email: subject line + 2 alternates, preview text, body copy, and a single clear CTA. Ask me for the goal (welcome / launch / re-engagement / promo) if it isn't obvious.",
  },
  {
    id: "google-ads",
    label: "Build Google Ads",
    description: "Search campaign with keywords, ads, and structure.",
    icon: "google-ads",
    prompt:
      "Build a Google Ads Search campaign. Include: campaign structure, 3 ad groups with themed keywords (exact + phrase), 3 Responsive Search Ads per group (15 headlines, 4 descriptions each), negative keyword list, and suggested daily budget range. Ask me for the offer if you need it.",
  },
  {
    id: "facebook-campaign",
    label: "Create Facebook Campaign",
    description: "Meta Ads campaign with audiences and creative.",
    icon: "facebook",
    prompt:
      "Design a Meta (Facebook + Instagram) ad campaign. Include: objective, 2 audience definitions (interest + lookalike), 3 creative concepts (hook, visual direction, primary text, headline, CTA), placements, and a suggested daily budget + testing plan.",
  },
  {
    id: "landing-page",
    label: "Generate Landing Page Copy",
    description: "High-converting page copy, section by section.",
    icon: "landing",
    prompt:
      "Write high-converting landing page copy for my offer. Sections: hero (headline + subhead + CTA), 3 benefit blocks, social proof placement, feature list, FAQ (6 questions), and final CTA. Match my brand voice. Ask me for the offer if I haven't shared it.",
  },
  {
    id: "marketing-audit",
    label: "Marketing Audit",
    description: "Full audit of what's working and what to fix.",
    icon: "audit",
    prompt:
      "Run a full marketing audit across my connected channels. Cover: what's working, what's underperforming, wasted spend, missing fundamentals, and the top 5 prioritized actions with estimated impact. Be direct — this is an executive briefing, not a pep talk.",
  },
];
