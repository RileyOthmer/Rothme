// Observation — a factual, plain-English read-out of a metric.
// Rothme is a Marketing Intelligence Platform. Observations report WHAT
// happened and, when the connected data supports it, WHY. They never
// recommend actions or score marketing quality.

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

export type Insight = {
  id: string;
  category: InsightCategory;
  headline: string;           // WHAT happened — one factual sentence
  direction: Direction;
  changePct?: number;         // e.g. -12 for a 12% drop
  reason: string;             // WHY — only when the data supports it
  evidence: Evidence[];
  confidencePct: number;      // 0–100, computed — never model-declared
  dataFreshnessHours: number;
  createdAt: string;
};
