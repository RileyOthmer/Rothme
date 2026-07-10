/**
 * ProviderAdapter — the single contract every marketing platform implements.
 *
 * Core rule: the app depends on this file and the unified MetricSnapshot shape.
 * It never depends on a specific provider. Adding a new platform means adding
 * one adapter folder and one line in registry.ts — nothing else.
 */

export type ProviderId =
  | "meta_ads"
  | "google_ads"
  | "ga4"
  | "shopify"
  | "stripe"
  | "tiktok"
  | "linkedin"
  | "pinterest"
  | "snapchat"
  | "x"
  | "youtube"
  | "klaviyo"
  | "mailchimp"
  | "hubspot";

export type ProviderCategory =
  | "ads"
  | "analytics"
  | "commerce"
  | "payments"
  | "email"
  | "social"
  | "crm";

export type AuthKind = "connector_gateway" | "oauth2" | "api_key";

export type DateRange = { start: string; end: string }; // ISO dates, inclusive

/**
 * The one row every adapter returns. If a metric doesn't fit, extend this
 * schema — never leak a provider-specific shape into the core.
 */
export type MetricSnapshot = {
  provider: ProviderId;
  metric:
    | "revenue"
    | "orders"
    | "sessions"
    | "users"
    | "new_customers"
    | "ad_spend"
    | "ad_impressions"
    | "ad_clicks"
    | "ad_conversions"
    | "email_sent"
    | "email_opens"
    | "email_clicks"
    | "leads";
  ts: string;              // ISO datetime — the metric's period start
  granularity: "hour" | "day" | "week";
  value: number;
  currency?: string;       // ISO 4217, only when value is monetary
  dimensions?: Record<string, string>; // campaign, channel, country, etc.
};

export type HealthStatus =
  | "connected"
  | "syncing"
  | "expired"
  | "rate_limited"
  | "missing_scope"
  | "upstream_error";

export type HealthReport = {
  status: HealthStatus;
  lastSyncedAt: string | null;
  message?: string; // plain English, safe to render to the user
};

export type ConnectResult =
  | { kind: "redirect"; url: string }         // OAuth start
  | { kind: "connected"; connectionId: string }; // gateway or api_key stored

/**
 * The context every adapter method receives. Provides scoped auth, the current
 * connection row, and a secrets accessor that resolves the env var name via
 * Lovable's connector layer — no adapter reads process.env directly.
 */
export type AdapterCtx = {
  userId: string;
  connectionId: string | null;
  secrets: {
    /** Returns the connector's API key value at runtime (server-only). */
    get(envName: string): string;
  };
};

/**
 * Typed errors adapters throw. The orchestrator decides retry/backoff/notify —
 * adapters just describe what went wrong.
 */
export class RateLimitError extends Error { retryAfterMs?: number; constructor(m: string, r?: number) { super(m); this.retryAfterMs = r; } }
export class AuthExpiredError extends Error {}
export class MissingScopeError extends Error { scope?: string; constructor(m: string, s?: string) { super(m); this.scope = s; } }
export class UpstreamError extends Error { status?: number; constructor(m: string, s?: number) { super(m); this.status = s; } }

export interface ProviderAdapter {
  readonly id: ProviderId;
  readonly name: string;
  readonly category: ProviderCategory;
  readonly authKind: AuthKind;
  /** One-sentence plain-English description shown in the connector catalog. */
  readonly blurb: string;

  connect(ctx: AdapterCtx): Promise<ConnectResult>;
  refresh(ctx: AdapterCtx): Promise<void>;
  pull(ctx: AdapterCtx, range: DateRange): Promise<MetricSnapshot[]>;
  health(ctx: AdapterCtx): Promise<HealthReport>;
  disconnect(ctx: AdapterCtx): Promise<void>;
}
