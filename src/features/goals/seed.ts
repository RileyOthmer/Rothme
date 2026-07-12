import type { Goal, GoalHistoryPoint, GoalMetric } from "./types";
import { METRIC_LABEL } from "./types";

const DAY = 24 * 60 * 60 * 1000;

function daysAgo(n: number): string {
  return new Date(Date.now() - n * DAY).toISOString().slice(0, 10);
}
function daysFromNow(n: number): string {
  return new Date(Date.now() + n * DAY).toISOString().slice(0, 10);
}

function makeHistory(start: number, current: number, weeks: number): GoalHistoryPoint[] {
  const points: GoalHistoryPoint[] = [];
  for (let i = 0; i <= weeks; i++) {
    const t = i / weeks;
    const value = start + (current - start) * t;
    points.push({ date: daysAgo((weeks - i) * 7), value: Math.round(value) });
  }
  return points;
}

export function getSeedGoals(): Goal[] {
  return [
    {
      id: "g_seed_revenue",
      metric: "revenue",
      title: "Grow monthly revenue to $15,000",
      target: 15000,
      current: 10420,
      startValue: 8200,
      startDate: daysAgo(42),
      dueDate: daysFromNow(20),
      impact: "high",
      impactReason: "Revenue is the direct measure of the business getting healthier.",
      recommendation: "Focus this week's ad budget on the two campaigns that drove 60% of sales last month.",
      source: "user",
      confidencePct: 78,
      history: makeHistory(8200, 10420, 6),
      createdAt: daysAgo(42),
    },
    {
      id: "g_seed_roas",
      metric: "roas",
      title: "Lift return on ad spend above 3.0x",
      target: 3.0,
      current: 2.4,
      startValue: 1.9,
      startDate: daysAgo(28),
      dueDate: daysFromNow(14),
      impact: "high",
      impactReason: "Every extra 0.1x here means roughly $400 more sales for the same spend.",
      recommendation: "Pause the bottom-performing audience in Meta Ads and shift budget to the top two.",
      source: "ai_recommended",
      confidencePct: 82,
      history: makeHistory(190, 240, 4).map((p) => ({ ...p, value: p.value / 100 })),
      createdAt: daysAgo(28),
    },
  ];
}

/**
 * Deterministic "AI-recommended" starter goals — presented to the user in the
 * Recommended tab. Later this becomes a call to the strategist.
 */
export function getRecommendedGoals(): Array<{
  metric: GoalMetric;
  title: string;
  target: number;
  suggestedDurationDays: number;
  reason: string;
  impact: "high" | "medium" | "low";
}> {
  return [
    {
      metric: "sessions",
      title: `${METRIC_LABEL.sessions}: reach 15,000 visits/month`,
      target: 15000,
      suggestedDurationDays: 60,
      reason: "Traffic is up 5% this month — a small SEO push should turn that into steady growth.",
      impact: "medium",
    },
    {
      metric: "email_subscribers",
      title: `${METRIC_LABEL.email_subscribers}: grow list to 2,500`,
      target: 2500,
      suggestedDurationDays: 45,
      reason: "Email drives your highest-margin repeat sales — the list is the fastest lever you have.",
      impact: "high",
    },
    {
      metric: "orders",
      title: `${METRIC_LABEL.orders}: 120 orders next month`,
      target: 120,
      suggestedDurationDays: 30,
      reason: "You averaged 92 last month. 120 is a realistic stretch based on current traffic.",
      impact: "high",
    },
    {
      metric: "followers",
      title: `${METRIC_LABEL.followers}: +500 new followers`,
      target: 500,
      suggestedDurationDays: 30,
      reason: "Social is steady but slow — a modest push here compounds over the next quarter.",
      impact: "low",
    },
  ];
}
