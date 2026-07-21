// Observation object — a factual, plain-English read-out of a metric.
// Rothme reports what the connected data shows and, when possible, why.
// It never recommends actions or judges marketing quality.

export type ObservationCategory = "notable" | "steady" | "watch";
export type ImpactLevel = "high" | "medium" | "low";
export type DecisionStatus = "open" | "reviewed" | "snoozed" | "dismissed";

export type SupportingDatum = {
  label: string; // plain English, e.g. "Cost per result"
  value: string; // formatted, e.g. "$18.40"
  change?: string; // e.g. "+23% vs last week"
  source: string; // e.g. "Meta Ads"
};

// Legacy alias kept so existing routes (`Priority`, `priority`) still compile.
export type Priority = ObservationCategory;

export type Decision = {
  id: string;
  priority: ObservationCategory;
  headline: string; // one factual sentence
  reason: string; // why — only when the data supports it
  recommendation: string; // "How this is calculated" — never advice
  confidencePct: number; // 0-100, computed — never model-declared
  impact: ImpactLevel;
  supportingData: SupportingDatum[];
  estimatedTimeMinutes: number; // kept for schema compat; unused in UI
  estimatedResult: string; // "Data source" note
  dataFreshnessHours: number;
  status: DecisionStatus;
  createdAt: string;
};
