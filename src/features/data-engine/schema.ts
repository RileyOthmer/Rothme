/**
 * Unified Data Engine — schema.
 *
 * ONE shape for every marketing metric, from every provider, for every user.
 * If a value doesn't fit here, it doesn't enter Velora.
 *
 * Design rules:
 * - Only PRIMITIVE metrics are stored. Ratios (CTR, CPA, ROAS, conversion
 *   rate, AOV, bounce rate) are DERIVED on read — never stored — so their
 *   definition can never drift.
 * - Every value carries its unit and its source. The AI never guesses units.
 * - Every snapshot is immutable and idempotent: the primary key
 *   (user_id, provider, metric, dimension_key, period_start, granularity)
 *   lets adapters re-run safely without duplicates.
 * - Time is stored in UTC. User-local bucketing happens on read.
 */

import { z } from "zod";

/** Every provider that can push into the engine. Extend via the integration registry, not by hard-coding here. */
export const PROVIDER_IDS = [
  "google_ads", "meta_ads", "tiktok_ads",
  "ga4", "search_console", "microsoft_clarity",
  "shopify", "woocommerce", "bigcommerce", "squarespace", "wix",
  "stripe", "square", "paypal",
  "mailchimp", "klaviyo", "constant_contact", "activecampaign",
  "hubspot",
  "instagram", "facebook", "threads", "whatsapp_business",
  "tiktok", "linkedin", "x", "pinterest", "snapchat", "youtube",
  "google_business_profile",
] as const;
export type ProviderId = (typeof PROVIDER_IDS)[number];

/**
 * Primitive metrics — the atoms. These are the ONLY things adapters emit
 * and the ONLY things stored. Everything else is derived.
 */
export const PRIMITIVE_METRICS = [
  // Money (currency-typed)
  "revenue",         // money in
  "spend",           // ad spend

  // Counts (integer, unitless)
  "orders",
  "leads",
  "impressions",
  "reach",           // unique people, when the provider distinguishes
  "clicks",
  "conversions",
  "sessions",
  "email_sends",
  "email_opens",
  "email_clicks",
  "email_unsubscribes",
  "followers",
  "post_engagements",
  "video_views",

  // Sums used to derive averages (never store averages)
  "session_duration_seconds",  // sum → AOV-style avg on read
  "bounced_sessions",          // → bounce rate on read
] as const;
export type PrimitiveMetric = (typeof PRIMITIVE_METRICS)[number];

/** Ratios computed at read time from primitives above. Do NOT store these. */
export const DERIVED_METRICS = [
  "ctr",                  // clicks / impressions
  "conversion_rate",      // conversions / clicks (ads) OR conversions / sessions (site)
  "cpa",                  // spend / conversions
  "cpc",                  // spend / clicks
  "roas",                 // revenue / spend
  "aov",                  // revenue / orders
  "bounce_rate",          // bounced_sessions / sessions
  "email_open_rate",      // email_opens / email_sends
  "email_click_rate",     // email_clicks / email_sends
  "avg_session_duration", // session_duration_seconds / sessions
  "engagement_rate",      // post_engagements / reach
] as const;
export type DerivedMetric = (typeof DERIVED_METRICS)[number];

export type Metric = PrimitiveMetric | DerivedMetric;

export const GRANULARITIES = ["hour", "day", "week", "month"] as const;
export type Granularity = (typeof GRANULARITIES)[number];

/**
 * Plain-English label for one metric. The map lives here so the AI, the UI,
 * and Advanced Mode all read from the same source of truth.
 */
export const METRIC_LABEL: Record<Metric, { plain: string; jargon: string; kind: "money" | "count" | "rate" | "seconds" }> = {
  revenue:            { plain: "money you made",           jargon: "Revenue",              kind: "money" },
  spend:              { plain: "money you spent on ads",   jargon: "Ad spend",             kind: "money" },
  orders:             { plain: "orders",                   jargon: "Orders",               kind: "count" },
  leads:              { plain: "new leads",                jargon: "Leads",                kind: "count" },
  impressions:        { plain: "times shown",              jargon: "Impressions",          kind: "count" },
  reach:              { plain: "people reached",           jargon: "Reach",                kind: "count" },
  clicks:             { plain: "clicks",                   jargon: "Clicks",               kind: "count" },
  conversions:        { plain: "customers you gained",     jargon: "Conversions",          kind: "count" },
  sessions:           { plain: "visits",                   jargon: "Sessions",             kind: "count" },
  email_sends:        { plain: "emails sent",              jargon: "Email sends",          kind: "count" },
  email_opens:        { plain: "emails opened",            jargon: "Email opens",          kind: "count" },
  email_clicks:       { plain: "email clicks",             jargon: "Email clicks",         kind: "count" },
  email_unsubscribes: { plain: "unsubscribes",             jargon: "Unsubscribes",         kind: "count" },
  followers:          { plain: "followers",                jargon: "Followers",            kind: "count" },
  post_engagements:   { plain: "likes, comments, shares",  jargon: "Engagements",          kind: "count" },
  video_views:        { plain: "video views",              jargon: "Video views",          kind: "count" },
  session_duration_seconds: { plain: "time on site",       jargon: "Total session time",   kind: "seconds" },
  bounced_sessions:   { plain: "visits that left quickly", jargon: "Bounced sessions",     kind: "count" },

  ctr:                { plain: "click rate",               jargon: "CTR",                  kind: "rate" },
  conversion_rate:    { plain: "how often visits become customers", jargon: "Conversion rate", kind: "rate" },
  cpa:                { plain: "cost per new customer",    jargon: "CPA",                  kind: "money" },
  cpc:                { plain: "cost per click",           jargon: "CPC",                  kind: "money" },
  roas:               { plain: "return on ad spend",       jargon: "ROAS",                 kind: "rate" },
  aov:                { plain: "average order size",       jargon: "AOV",                  kind: "money" },
  bounce_rate:        { plain: "visits that left quickly", jargon: "Bounce rate",          kind: "rate" },
  email_open_rate:    { plain: "how many opened your email", jargon: "Open rate",          kind: "rate" },
  email_click_rate:   { plain: "how many clicked your email", jargon: "Click rate",        kind: "rate" },
  avg_session_duration: { plain: "average time per visit", jargon: "Avg. session duration", kind: "seconds" },
  engagement_rate:    { plain: "how often people engaged", jargon: "Engagement rate",      kind: "rate" },
};

/**
 * One atomic data point. Immutable. This is the ONLY shape adapters emit
 * and the ONLY row shape stored in `metric_snapshots`.
 *
 * `dimension_key` is a stable, sorted "k=v;k=v" string of secondary dimensions
 * (campaign_id, channel, country, etc.) — kept as a string so the DB unique
 * key stays simple. Empty string means "account-wide total for this metric".
 */
export const MetricSnapshotSchema = z.object({
  provider: z.enum(PROVIDER_IDS),
  metric: z.enum(PRIMITIVE_METRICS),
  value: z.number().finite(),
  currency: z.string().length(3).nullable(), // ISO-4217 for money metrics, null otherwise
  period_start: z.string(),  // ISO UTC
  granularity: z.enum(GRANULARITIES),
  dimension_key: z.string().default(""), // "" = account-wide
  dimensions: z.record(z.string(), z.string()).default({}), // parsed form of dimension_key
  /** 0..1. Adapter-declared certainty (e.g. sampled GA4 data < 1). */
  confidence: z.number().min(0).max(1).default(1),
  /** When the adapter fetched this data. */
  captured_at: z.string(),
});
export type MetricSnapshot = z.infer<typeof MetricSnapshotSchema>;

/**
 * Canonicalize dimensions into a stable key. Sorted, semicolon-separated,
 * so `{campaign: "x", channel: "y"}` and `{channel: "y", campaign: "x"}`
 * collapse to the same row.
 */
export function dimensionKey(dims: Record<string, string> | undefined | null): string {
  if (!dims) return "";
  const entries = Object.entries(dims).filter(([, v]) => v != null && v !== "");
  if (entries.length === 0) return "";
  entries.sort(([a], [b]) => a.localeCompare(b));
  return entries.map(([k, v]) => `${k}=${v}`).join(";");
}

export function parseDimensionKey(key: string): Record<string, string> {
  if (!key) return {};
  const out: Record<string, string> = {};
  for (const part of key.split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    out[part.slice(0, eq)] = part.slice(eq + 1);
  }
  return out;
}
