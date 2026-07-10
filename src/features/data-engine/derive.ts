/**
 * Derived-metric math. Computed on read, never stored.
 *
 * Any zero denominator returns `null` — never NaN, never Infinity. Callers
 * (dashboard, AI) render `null` as "not enough data yet", never as "0".
 */

import type { DerivedMetric, MetricSnapshot, PrimitiveMetric } from "./schema";

type PrimitiveTotals = Partial<Record<PrimitiveMetric, number>>;

function safeDivide(numerator: number | undefined, denominator: number | undefined): number | null {
  if (numerator == null || denominator == null) return null;
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator)) return null;
  if (denominator === 0) return null;
  return numerator / denominator;
}

export function sumPrimitives(snapshots: MetricSnapshot[]): PrimitiveTotals {
  const totals: PrimitiveTotals = {};
  for (const s of snapshots) {
    totals[s.metric] = (totals[s.metric] ?? 0) + s.value;
  }
  return totals;
}

/**
 * Compute one derived metric from a bag of primitive totals.
 * Returns null when the inputs are missing or the denominator is zero.
 */
export function derive(metric: DerivedMetric, t: PrimitiveTotals): number | null {
  switch (metric) {
    case "ctr":                  return safeDivide(t.clicks, t.impressions);
    case "conversion_rate":      return safeDivide(t.conversions, t.clicks ?? t.sessions);
    case "cpa":                  return safeDivide(t.spend, t.conversions);
    case "cpc":                  return safeDivide(t.spend, t.clicks);
    case "roas":                 return safeDivide(t.revenue, t.spend);
    case "aov":                  return safeDivide(t.revenue, t.orders);
    case "bounce_rate":          return safeDivide(t.bounced_sessions, t.sessions);
    case "email_open_rate":      return safeDivide(t.email_opens, t.email_sends);
    case "email_click_rate":     return safeDivide(t.email_clicks, t.email_sends);
    case "avg_session_duration": return safeDivide(t.session_duration_seconds, t.sessions);
    case "engagement_rate":      return safeDivide(t.post_engagements, t.reach);
  }
}
