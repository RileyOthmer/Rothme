/**
 * Quick Actions — educational prompts on the dashboard.
 *
 * Rothme is a Marketing Intelligence Platform. These actions only ask the
 * assistant to EXPLAIN, DEFINE, or SUMMARIZE — never to recommend, score,
 * or generate marketing content.
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
  | "explain"
  | "define"
  | "summary"
  | "changes"
  | "formula"
  | "source"
  | "chart"
  | "glossary";

export type QuickAction = {
  id: string;
  label: string;
  description: string;
  prompt: string;
  icon: QuickActionIcon;
};

export const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "explain-ctr",
    label: "Explain my CTR",
    description: "What click-through rate means and what mine currently is.",
    icon: "explain",
    prompt:
      "Explain what my current click-through rate (CTR) is across my connected ad platforms this week. Define CTR in plain English, show the number from each platform, and describe how Rothme calculates it. Do not recommend any changes.",
  },
  {
    id: "define-reach",
    label: "What does reach mean?",
    description: "Plain-English definition, formula, and platform differences.",
    icon: "define",
    prompt:
      "Define 'reach' in plain English. Include the formula, why the metric exists, how it differs from impressions, and how each connected platform (Meta, Instagram, Google Ads) reports it. Do not make recommendations.",
  },
  {
    id: "summarize-30d",
    label: "Summarize the last 30 days",
    description: "A factual read-out of what happened, with sources.",
    icon: "summary",
    prompt:
      "Summarize what happened across my connected marketing platforms in the last 30 days. Report facts only: what changed, when, and which platform the data came from. Do not include recommendations, next steps, or opinions on quality.",
  },
  {
    id: "how-health-score",
    label: "How is my Health Score calculated?",
    description: "Every input, every weight, plainly explained.",
    icon: "formula",
    prompt:
      "Explain exactly how Rothme calculates the Marketing Health Score. List every input, its weight, and where the underlying data comes from. Clarify that this score reflects operational health of connected systems only — not marketing quality or business performance.",
  },
  {
    id: "define-roas",
    label: "Define ROAS, CAC and CPM",
    description: "Formulas, examples, and common misconceptions.",
    icon: "glossary",
    prompt:
      "Define ROAS, CAC and CPM in plain English. For each: give the formula, an example calculation, why the metric exists, and one common misconception. No recommendations.",
  },
  {
    id: "what-changed",
    label: "What changed this week?",
    description: "A factual diff vs. the previous 7 days.",
    icon: "changes",
    prompt:
      "List every notable change across my connected platforms this week vs. the previous 7 days. Group by platform. For each change: what moved, by how much, when it was last synced. State facts only — do not interpret whether the change is good or bad, and do not suggest actions.",
  },
  {
    id: "explain-chart",
    label: "Explain this chart",
    description: "Ask about any chart on the dashboard.",
    icon: "chart",
    prompt:
      "I'm looking at a chart on my Rothme dashboard. Explain what this chart represents, which platform the data comes from, how the values are calculated, and how to read it. Do not tell me what to do with it.",
  },
  {
    id: "where-from",
    label: "Where did this number come from?",
    description: "Trace a metric back to its source platform.",
    icon: "source",
    prompt:
      "Pick a metric shown on my dashboard and trace exactly where the number came from: which connected platform reported it, when it was last synced, and how Rothme derived the displayed value from that raw data.",
  },
];
