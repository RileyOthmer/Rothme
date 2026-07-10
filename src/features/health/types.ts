// Marketing Health Score — Velora's signature verdict.
// Seven pillars, each scored 0-100, all in plain English.
// Overall = confidence-weighted average of pillars with enough data.

export type PillarId =
  | "advertising"
  | "seo"
  | "email"
  | "social"
  | "website"
  | "retention"
  | "revenue";

export type PillarTrend = "up" | "flat" | "down" | "unknown";
export type PillarBand = "strong" | "steady" | "shaky" | "weak" | "no_data";

export type PillarScore = {
  id: PillarId;
  label: string; // "Advertising"
  score: number | null; // null = not enough data
  band: PillarBand;
  trend: PillarTrend;
  trendText: string; // "Up 4 points this week"
  status: string; // one plain-English sentence — "current status"
  explanation: string; // why this score, in owner language
  opportunity: string; // the single biggest thing to improve
  actionPlan: string; // one concrete next step
  dataFreshnessHours: number;
};

export type HealthScore = {
  overall: number | null; // null if too few pillars have data
  overallBand: PillarBand;
  overallTrend: PillarTrend;
  overallTrendText: string;
  summary: string; // one sentence — "what this means for your business"
  pillars: PillarScore[];
  computedAt: string; // ISO
};

export function bandFor(score: number | null): PillarBand {
  if (score === null) return "no_data";
  if (score >= 85) return "strong";
  if (score >= 70) return "steady";
  if (score >= 50) return "shaky";
  return "weak";
}

export const BAND_LABEL: Record<PillarBand, string> = {
  strong: "Strong",
  steady: "Steady",
  shaky: "Needs attention",
  weak: "At risk",
  no_data: "Not enough data yet",
};
