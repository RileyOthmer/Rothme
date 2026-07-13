// Shared types + constants used by both server functions and the admin UI.

export const PLATFORMS = [
  { id: "instagram", label: "Instagram" },
  { id: "facebook",  label: "Facebook" },
  { id: "threads",   label: "Threads" },
  { id: "tiktok",    label: "TikTok" },
  { id: "linkedin",  label: "LinkedIn" },
  { id: "x",         label: "X" },
  { id: "youtube",   label: "YouTube" },
  { id: "pinterest", label: "Pinterest" },
  { id: "gbp",       label: "Google Business Profile" },
  { id: "bluesky",   label: "Bluesky" },
  { id: "mastodon",  label: "Mastodon" },
] as const;

export type PlatformId = (typeof PLATFORMS)[number]["id"];

export const KPI_CATALOG = [
  "followers", "reach", "impressions", "engagement", "likes", "comments",
  "shares", "saves", "profile_visits", "website_clicks", "ctr", "video_views",
  "watch_time", "conversions", "revenue", "roas", "cost_per_click",
  "cost_per_acquisition", "campaign_spend",
] as const;

export type KpiId = (typeof KPI_CATALOG)[number];

// Non-secret configuration blob shape.
export type IntegrationConfig = {
  redirect_uri?: string;
  oauth_url?: string;
  base_api_url?: string;
  scopes?: string;
  version?: string;
  auth_method?: "oauth2" | "bearer" | "api_key" | "basic" | "none";
  http_method?: "GET" | "POST";
  endpoint_path?: string;
  headers?: Record<string, string>;
  query_params?: Record<string, string>;
  body_template?: string;
  pagination?: string;
  retry?: { attempts?: number; backoff_ms?: number };
  timeout_ms?: number;
  rate_limit?: { rpm?: number; burst?: number };
  rest_or_graphql?: "rest" | "graphql";
  webhook_url?: string;
  notes?: string;
};

// Secret fields; stored only encrypted at rest.
export type IntegrationSecrets = {
  client_id?: string;
  client_secret?: string;
  api_key?: string;
  api_secret?: string;
  access_token?: string;
  refresh_token?: string;
  webhook_secret?: string;
};

export const SECRET_FIELDS: Array<{ id: keyof IntegrationSecrets; label: string }> = [
  { id: "client_id",      label: "Client ID" },
  { id: "client_secret",  label: "Client Secret" },
  { id: "api_key",        label: "API Key" },
  { id: "api_secret",     label: "API Secret" },
  { id: "access_token",   label: "Access Token" },
  { id: "refresh_token",  label: "Refresh Token" },
  { id: "webhook_secret", label: "Webhook Secret" },
];

export type IntegrationRow = {
  platform: PlatformId;
  display_name: string;
  enabled: boolean;
  verified: boolean;
  status: "draft" | "tested" | "verified" | "error";
  status_message: string | null;
  config: IntegrationConfig;
  secrets_masked: Partial<Record<keyof IntegrationSecrets, string>>;
  last_tested_at: string | null;
  updated_at: string;
};

export type KpiMapping = {
  id: string;
  platform: PlatformId;
  internal_kpi: KpiId | string;
  external_field: string;
  data_type: "number" | "percent" | "currency" | "duration";
  update_frequency: "realtime" | "hourly" | "daily" | "weekly";
  description: string | null;
  confirmed: boolean;
};

export type JsonLike =
  | string | number | boolean | null
  | { [k: string]: JsonLike }
  | JsonLike[];

export type IntegrationLog = {
  id: string;
  platform: string;
  event_type: string;
  success: boolean | null;
  status_code: number | null;
  message: string | null;
  request: JsonLike;
  response: JsonLike;
  created_at: string;
};
