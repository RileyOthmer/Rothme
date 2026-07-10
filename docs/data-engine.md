# Unified Data Engine

The single source of truth for every marketing metric in Velora.

## Why it exists

Every provider names things differently. Meta says "reach," GA4 says
"totalUsers," Shopify says "orders_count." The AI cannot reason across
platforms while that noise exists — so we normalize once, at the edge,
into ONE shape.

## The rule

**The AI, the dashboard, and reports read ONLY from the engine.**
They never call a provider API. Adapters are the only code allowed to
touch providers.

```text
provider APIs → adapters → MetricSnapshot[] → metric_snapshots table
                                                   │
                                       getMetrics()  ← AI / UI / Reports
```

## What's stored

`metric_snapshots` holds only **primitive** metrics — the atoms:

- Money: `revenue`, `spend`
- Counts: `orders`, `leads`, `impressions`, `reach`, `clicks`,
  `conversions`, `sessions`, `email_sends`, `email_opens`,
  `email_clicks`, `email_unsubscribes`, `followers`,
  `post_engagements`, `video_views`
- Sums used to derive averages: `session_duration_seconds`,
  `bounced_sessions`

## What's derived (never stored)

Computed at read time from primitives so definitions can't drift:

`ctr`, `conversion_rate`, `cpa`, `cpc`, `roas`, `aov`, `bounce_rate`,
`email_open_rate`, `email_click_rate`, `avg_session_duration`,
`engagement_rate`.

Any zero denominator returns `null` — never `NaN` or `0`. The AI
renders `null` as "not enough data yet."

## Row shape

Primary key: `(user_id, provider, metric, dimension_key, period_start, granularity)`.

`dimension_key` is a stable, sorted `k=v;k=v` string of secondary
dimensions (campaign, channel, country, …). Empty = account-wide total.

This makes re-runs idempotent: fetching the same window twice updates
the same row instead of duplicating.

## Adding an adapter

1. Create `src/features/data-engine/adapters/<provider>.adapter.ts`
   exporting an `Adapter` object.
2. Register it in `adapters/index.ts` via `registerAdapter(...)`.
3. Adapter code is the ONLY code allowed to import a provider SDK.
4. Return `MetricSnapshot[]` — nothing else. Do not store, do not
   render, do not call the AI.

## Consuming the engine

```ts
import { getMetrics, METRIC_LABEL } from "@/features/data-engine";

const result = await getMetrics({
  data: {
    from: startISO,
    to: endISO,
    metrics: ["revenue", "orders", "roas"],
    granularity: "day",
  },
});

// result.totals.revenue   → 12400
// result.derived.roas     → 3.2  or  null
// result.confidence       → 0.87
// result.providersReporting → ["shopify", "meta_ads"]
```

## Confidence

Every snapshot carries `confidence` (0..1). `getMetrics()` returns the
**min** across contributing snapshots. The AI must include this in its
response — never present sampled or partial data as certain.
