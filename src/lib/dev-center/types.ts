// Modular Universal Integration Engine — shared types.
export type JsonLike =
  | string | number | boolean | null
  | JsonLike[]
  | { [k: string]: JsonLike };

export type AuthType =
  | "none" | "api_key" | "bearer" | "basic" | "jwt"
  | "oauth2" | "oauth2_pkce" | "webhook_only" | "custom";

export interface Platform {
  id: string;
  slug: string;
  name: string;
  logo_url: string | null;
  description: string | null;
  category: string | null;
  base_url: string | null;
  api_version: string | null;
  auth_type: AuthType;
  authorization_url: string | null;
  token_url: string | null;
  refresh_url: string | null;
  redirect_uri: string | null;
  scopes: string[];
  webhook_endpoint: string | null;
  default_headers: Record<string, string>;
  timeout_ms: number;
  retry_count: number;
  rate_limit: Record<string, JsonLike>;
  status: "needs_configuration" | "tested" | "verified" | "error";
  notes: string | null;
  enabled: boolean;
  verified: boolean;
  secrets_masked: Partial<Record<SecretField, string>>;
  created_at: string;
  updated_at: string;
}

export const SECRET_FIELDS = [
  "client_id", "client_secret", "api_key", "api_secret",
  "access_token", "refresh_token", "webhook_secret", "jwt_secret",
  "basic_username", "basic_password",
] as const;
export type SecretField = typeof SECRET_FIELDS[number];
export type PlatformSecrets = Partial<Record<SecretField, string>>;

export interface PlatformEndpoint {
  id: string;
  platform_id: string;
  name: string;
  http_method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  headers: Record<string, string>;
  query_params: Record<string, string>;
  body: string | null;
  auth_override: Record<string, JsonLike>;
  pagination: Record<string, JsonLike>;
  rate_limit: Record<string, JsonLike>;
  parser: Record<string, JsonLike>;
  validation: Record<string, JsonLike>;
  example_response: JsonLike | null;
  last_tested_at: string | null;
  last_status: number | null;
  created_at: string;
  updated_at: string;
}

export interface FieldMapping {
  id: string;
  platform_id: string;
  endpoint_id: string | null;
  ROTHME_kpi: string;
  json_path: string;
  data_type: "number" | "percent" | "currency" | "duration" | "string" | "boolean";
  category: string | null;
  formatting: string | null;
  aggregation: string | null;
  calculation_formula: string | null;
  display_name: string | null;
  chart_type: string | null;
  unit: string | null;
  description: string | null;
  example_value: JsonLike | null;
  confirmed: boolean;
  created_at: string;
  updated_at: string;
}
