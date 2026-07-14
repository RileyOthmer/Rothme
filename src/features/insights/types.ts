// AI Insight — the AI's plain-English reading of a metric.
// Follows ROTHME's four-questions voice contract: What happened? Why?
// What should I do? Would you like me to help?
// See mem://ai/voice-contract.

export type InsightCategory =
  | "engagement"
  | "content"
  | "platform"
  | "audience"
  | "advertising"
  | "revenue";

export type Direction = "up" | "down" | "flat";

export type Evidence = {
  label: string;   // "Posting frequency"
  value: string;   // "3 posts / week"
  change?: string; // "−45% vs last week"
  source: string;  // "Instagram"
};

export type RecommendedAction = {
  id: string;
  label: string;              // "Create 3 more Reels"
  estimatedMinutes?: number;
  expectedLift?: string;      // "+8–12% engagement, typical"
  cta?: { label: string; to: string };
};

export type Insight = {
  id: string;
  category: InsightCategory;
  headline: string;           // WHAT happened — one sentence
  direction: Direction;
  changePct?: number;         // e.g. -12 for a 12% drop
  reason: string;             // WHY it happened
  evidence: Evidence[];
  actions: RecommendedAction[];
  confidencePct: number;      // 0–100, computed — never model-declared
  dataFreshnessHours: number;
  createdAt: string;
};
