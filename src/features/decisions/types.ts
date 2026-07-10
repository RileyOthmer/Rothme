// Decision object — the AI's answer to "what should I do?"
// Every Decision must carry evidence and honest confidence.
// See mem://ai/voice-contract.

export type Priority = "high" | "medium" | "low";
export type ImpactLevel = "high" | "medium" | "low";
export type DecisionStatus = "open" | "accepted" | "snoozed" | "dismissed";

export type SupportingDatum = {
  label: string; // plain English, e.g. "Cost per result"
  value: string; // formatted, e.g. "$18.40"
  change?: string; // e.g. "+23% vs last week"
  source: string; // e.g. "Meta Ads"
};

export type Decision = {
  id: string;
  priority: Priority;
  headline: string; // one sentence, plain English
  reason: string; // why this is happening
  recommendation: string; // what to do
  confidencePct: number; // 0-100, computed — never model-declared
  impact: ImpactLevel;
  supportingData: SupportingDatum[];
  estimatedTimeMinutes: number;
  estimatedResult: string; // plain English, honest, hedged
  dataFreshnessHours: number; // for stale badge
  status: DecisionStatus;
  createdAt: string; // ISO
};
