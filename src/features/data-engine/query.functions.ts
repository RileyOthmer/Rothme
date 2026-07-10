/**
 * Unified Data Engine — query.
 *
 * The ONLY reader that the AI, dashboard, and reports use. Nothing else may
 * call provider APIs directly. If you find yourself importing an adapter
 * from the UI or the AI prompt, stop — read through here instead.
 *
 * Returns primitives from storage; derived metrics (CTR, CPA, ROAS, AOV,
 * bounce rate, open rate, engagement rate, avg session duration) are
 * computed at read time and returned as `derived` alongside `totals`.
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  DERIVED_METRICS, GRANULARITIES, PRIMITIVE_METRICS, PROVIDER_IDS,
  type DerivedMetric, type MetricSnapshot, type PrimitiveMetric,
} from "./schema";
import { derive, sumPrimitives } from "./derive";

const QueryInput = z.object({
  /** ISO UTC, inclusive. */
  from: z.string(),
  /** ISO UTC, exclusive. */
  to: z.string(),
  /** If empty, all metrics the user has data for. */
  metrics: z.array(z.enum([...PRIMITIVE_METRICS, ...DERIVED_METRICS])).default([]),
  providers: z.array(z.enum(PROVIDER_IDS)).default([]),
  granularity: z.enum(GRANULARITIES).default("day"),
});

export type MetricQueryResult = {
  window: { from: string; to: string; granularity: string };
  /** Sums of primitive metrics across the window, keyed by metric. */
  totals: Partial<Record<PrimitiveMetric, number>>;
  /** Derived ratios computed from `totals`. `null` when denominator is 0 or inputs missing. */
  derived: Partial<Record<DerivedMetric, number | null>>;
  /** Per-provider primitives, for cross-source breakdowns. */
  byProvider: Record<string, Partial<Record<PrimitiveMetric, number>>>;
  /** Raw snapshots, if a consumer needs to render a timeseries. Capped for safety. */
  snapshots: MetricSnapshot[];
  /** How complete the underlying data is. 1 = full confidence, 0 = none. */
  confidence: number;
  /** Provider ids that had at least one row in the window. */
  providersReporting: string[];
};

export const getMetrics = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => QueryInput.parse(data))
  .handler(async ({ data, context }): Promise<MetricQueryResult> => {
    // Derived metrics translate into their primitive dependencies at query time.
    const primitiveDeps = new Set<PrimitiveMetric>();
    const requestedPrimitives = new Set<PrimitiveMetric>();
    const requestedDerived = new Set<DerivedMetric>();
    for (const m of data.metrics) {
      if ((PRIMITIVE_METRICS as readonly string[]).includes(m)) {
        requestedPrimitives.add(m as PrimitiveMetric);
        primitiveDeps.add(m as PrimitiveMetric);
      } else {
        requestedDerived.add(m as DerivedMetric);
        for (const dep of PRIMITIVE_DEPS[m as DerivedMetric]) primitiveDeps.add(dep);
      }
    }
    const primitiveFilter = data.metrics.length === 0 ? null : [...primitiveDeps];

    let query = context.supabase
      .from("metric_snapshots")
      .select("provider, metric, value, currency, period_start, granularity, dimension_key, dimensions, confidence, captured_at")
      .eq("user_id", context.userId)
      .eq("granularity", data.granularity)
      .gte("period_start", data.from)
      .lt("period_start", data.to)
      .order("period_start", { ascending: true })
      .limit(5000);

    if (primitiveFilter) query = query.in("metric", primitiveFilter);
    if (data.providers.length > 0) query = query.in("provider", data.providers);

    const { data: rows, error } = await query;
    if (error) throw new Error(`query failed: ${error.message}`);

    const snapshots: MetricSnapshot[] = (rows ?? []).map((r) => ({
      provider: r.provider as MetricSnapshot["provider"],
      metric: r.metric as MetricSnapshot["metric"],
      value: r.value,
      currency: r.currency,
      period_start: r.period_start,
      granularity: r.granularity as MetricSnapshot["granularity"],
      dimension_key: r.dimension_key,
      dimensions: (r.dimensions ?? {}) as Record<string, string>,
      confidence: r.confidence,
      captured_at: r.captured_at,
    }));

    const totals = sumPrimitives(snapshots);
    const derived: Partial<Record<DerivedMetric, number | null>> = {};
    const derivedToCompute =
      requestedDerived.size > 0 ? [...requestedDerived] : [...DERIVED_METRICS];
    for (const d of derivedToCompute) derived[d] = derive(d, totals);

    const byProvider: Record<string, Partial<Record<PrimitiveMetric, number>>> = {};
    const providersReporting = new Set<string>();
    for (const s of snapshots) {
      providersReporting.add(s.provider);
      const bucket = byProvider[s.provider] ?? (byProvider[s.provider] = {});
      bucket[s.metric] = (bucket[s.metric] ?? 0) + s.value;
    }

    // Confidence is the min across contributing snapshots — the AI must know
    // when its answer rests on sampled or partial data.
    const confidence =
      snapshots.length === 0
        ? 0
        : snapshots.reduce((min, s) => Math.min(min, s.confidence), 1);

    // Trim requested primitives that weren't asked for, when a caller passed a filter.
    if (data.metrics.length > 0 && requestedPrimitives.size > 0) {
      for (const key of Object.keys(totals) as PrimitiveMetric[]) {
        if (!requestedPrimitives.has(key) && !primitiveDeps.has(key)) delete totals[key];
      }
    }

    return {
      window: { from: data.from, to: data.to, granularity: data.granularity },
      totals,
      derived,
      byProvider,
      snapshots,
      confidence,
      providersReporting: [...providersReporting],
    };
  });

/** Which primitives each derived metric depends on. */
const PRIMITIVE_DEPS: Record<DerivedMetric, PrimitiveMetric[]> = {
  ctr:                  ["clicks", "impressions"],
  conversion_rate:      ["conversions", "clicks", "sessions"],
  cpa:                  ["spend", "conversions"],
  cpc:                  ["spend", "clicks"],
  roas:                 ["revenue", "spend"],
  aov:                  ["revenue", "orders"],
  bounce_rate:          ["bounced_sessions", "sessions"],
  email_open_rate:      ["email_opens", "email_sends"],
  email_click_rate:     ["email_clicks", "email_sends"],
  avg_session_duration: ["session_duration_seconds", "sessions"],
  engagement_rate:      ["post_engagements", "reach"],
};
