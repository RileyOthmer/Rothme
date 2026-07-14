// Goals — user-set business targets ROTHME tracks against unified metrics.
// A goal is always tied to one universal metric (revenue, orders, roas, ...)
// so progress can be computed from the Unified Data Engine.

export type GoalMetric =
  | "revenue"
  | "orders"
  | "roas"
  | "sessions"
  | "leads"
  | "email_subscribers"
  | "followers"
  | "appointments"
  | "conversions";

export type GoalStatus = "on_track" | "at_risk" | "behind" | "achieved";
export type ImpactLevel = "high" | "medium" | "low";
export type GoalSource = "user" | "ai_recommended";

export type GoalHistoryPoint = {
  /** ISO date (yyyy-mm-dd) */
  date: string;
  value: number;
};

export type Goal = {
  id: string;
  metric: GoalMetric;
  title: string;                // "Grow monthly revenue to $15,000"
  target: number;
  current: number;
  startValue: number;
  startDate: string;            // ISO
  dueDate: string;              // ISO
  impact: ImpactLevel;
  impactReason: string;         // one plain-English sentence
  recommendation: string;       // one specific next action
  source: GoalSource;
  confidencePct: number;        // AI's certainty in the forecast
  history: GoalHistoryPoint[];  // weekly snapshots
  createdAt: string;
};

export type GoalForecast = {
  /** Projected value at dueDate based on current pace. */
  projected: number;
  /** on_track / at_risk / behind / achieved */
  status: GoalStatus;
  /** % of target the projection lands at. */
  projectedPct: number;
  /** % of target achieved right now. */
  progressPct: number;
  /** Estimated completion date at current pace — null if pace is flat or negative. */
  estimatedCompletion: string | null;
  /** Days remaining until due. Negative = past due. */
  daysRemaining: number;
  /** One plain-English sentence. */
  summary: string;
};

export const METRIC_LABEL: Record<GoalMetric, string> = {
  revenue: "Revenue",
  orders: "Orders",
  roas: "Return on ad spend",
  sessions: "Website traffic",
  leads: "Leads",
  email_subscribers: "Email subscribers",
  followers: "Followers",
  appointments: "Appointments",
  conversions: "Conversions",
};

export const METRIC_UNIT: Record<GoalMetric, "currency" | "count" | "ratio"> = {
  revenue: "currency",
  orders: "count",
  roas: "ratio",
  sessions: "count",
  leads: "count",
  email_subscribers: "count",
  followers: "count",
  appointments: "count",
  conversions: "count",
};

export function formatMetricValue(metric: GoalMetric, value: number): string {
  const unit = METRIC_UNIT[metric];
  if (unit === "currency") {
    return value.toLocaleString(undefined, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    });
  }
  if (unit === "ratio") return `${value.toFixed(2)}x`;
  return Math.round(value).toLocaleString();
}

export const STATUS_LABEL: Record<GoalStatus, string> = {
  on_track: "On track",
  at_risk: "Slightly behind",
  behind: "Behind pace",
  achieved: "Achieved",
};
