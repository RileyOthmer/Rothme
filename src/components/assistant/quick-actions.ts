/**
 * Quick Actions — reusable presets that open the global Command Bar
 * pre-configured for a specific marketing task. All actions route through
 * the same AI engine (the CommandBar's /api/chat stream) — no duplicated
 * generation logic.
 *
 * A quick action dispatches an `askAI` CustomEvent; the CommandBar listens
 * for it, focuses/expands, and sends the prompt through its existing
 * useChat transport.
 */

export const ASK_AI_EVENT = "rothme:ask-ai";

export type AskAIPayload = {
  prompt: string;
  /** Optional label for analytics / debugging. */
  source?: string;
};

/** Trigger the global command bar with a preconfigured prompt. */
export function askAI(payload: AskAIPayload) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<AskAIPayload>(ASK_AI_EVENT, { detail: payload }));
}

export type QuickAction = {
  id: string;
  label: string;
  description: string;
  prompt: string;
  icon:
    | "post"
    | "ad"
    | "plan"
    | "campaign"
    | "gbp"
    | "tiktok"
    | "youtube";
};

export const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "social-post",
    label: "Create Social Post",
    description: "Draft a ready-to-review post for your top channel.",
    icon: "post",
    prompt:
      "Create a social media post I can review before publishing. Write it in my brand voice, keep it platform-appropriate, and include 2 short caption variants plus 5 relevant hashtags. Ask me for the platform if it matters.",
  },
  {
    id: "advertisement",
    label: "Create Advertisement",
    description: "Ad copy with headline, body, and CTA.",
    icon: "ad",
    prompt:
      "Write an advertisement I can review before running. Include: primary headline, 2 alternate headlines, body copy (under 125 characters), a clear call-to-action, and a one-line targeting suggestion. Ask me for the product/offer and platform if you need them.",
  },
  {
    id: "weekly-plan",
    label: "Create Weekly Plan",
    description: "A 7-day content plan across your channels.",
    icon: "plan",
    prompt:
      "Plan the next 7 days of marketing content for me. Give one post idea per day with: date label, channel, hook, and 1-line rationale tied to my goals. Keep it realistic — no more than one post per channel per day.",
  },
  {
    id: "campaign",
    label: "Generate Campaign",
    description: "A themed multi-channel campaign outline.",
    icon: "campaign",
    prompt:
      "Generate a multi-channel marketing campaign concept. Include: campaign name, single sentence promise, target audience, 3-week timeline, channels to use, 5 content pieces mapped to channels, and how we'll measure success. Ask me for the goal or offer if you need it.",
  },
  {
    id: "gbp-update",
    label: "Write Google Business Update",
    description: "A short GBP post that follows Google's rules.",
    icon: "gbp",
    prompt:
      "Write a Google Business Profile update. Under 1,500 characters, plain and useful, no marketing fluff, one clear call-to-action, no prohibited content (no discount-only spam, no external tracking URLs). Suggest an accompanying image idea in one line.",
  },
  {
    id: "tiktok-ideas",
    label: "Generate TikTok Ideas",
    description: "10 short-form video hooks tuned for TikTok.",
    icon: "tiktok",
    prompt:
      "Give me 10 TikTok video ideas tailored to my business. For each: hook (first 3 seconds), format (talking head / demo / trend / etc.), 1-line script beat, and suggested on-screen text. Keep them realistic to film with a phone.",
  },
  {
    id: "youtube-ideas",
    label: "Generate YouTube Ideas",
    description: "10 video ideas with titles and angles.",
    icon: "youtube",
    prompt:
      "Give me 10 YouTube video ideas for my business. For each: clickable title (under 60 characters), the angle/hook, target viewer, and rough length (short / 5-10 min / long-form). Prioritize ideas that could realistically rank or get recommended.",
  },
];
