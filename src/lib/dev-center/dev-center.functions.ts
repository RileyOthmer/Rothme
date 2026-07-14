// Server functions for the Universal Integration Engine (Developer Center).
// Admin-only CRUD for platforms, endpoints, and field mappings, plus a
// generic endpoint tester used by the JSON→KPI mapper UI.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  SECRET_FIELDS,
  type FieldMapping, type JsonLike, type Platform,
  type PlatformEndpoint, type PlatformSecrets, type SecretField,
} from "./types";
import { readJsonPath } from "./json-path";

// ---- helpers ---------------------------------------------------------------

async function assertAdmin(ctx: { supabase: any; userId: string }) {
  const { data, error } = await ctx.supabase
    .from("user_roles").select("role")
    .eq("user_id", ctx.userId).eq("role", "admin").maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin only");
}

function mask(v?: string | null) {
  if (!v) return "";
  if (v.length <= 6) return "••••";
  return "•".repeat(Math.max(4, v.length - 4)) + v.slice(-4);
}
function maskAll(s: PlatformSecrets) {
  const out: Partial<Record<SecretField, string>> = {};
  for (const f of SECRET_FIELDS) if (s[f]) out[f] = mask(s[f]);
  return out;
}

function rowToPlatform(r: any, secrets: PlatformSecrets): Platform {
  return {
    id: r.id, slug: r.slug, name: r.name,
    logo_url: r.logo_url, description: r.description, category: r.category,
    base_url: r.base_url, api_version: r.api_version,
    auth_type: r.auth_type, authorization_url: r.authorization_url,
    token_url: r.token_url, refresh_url: r.refresh_url,
    redirect_uri: r.redirect_uri, scopes: r.scopes ?? [],
    webhook_endpoint: r.webhook_endpoint,
    default_headers: r.default_headers ?? {}, timeout_ms: r.timeout_ms,
    retry_count: r.retry_count, rate_limit: r.rate_limit ?? {},
    status: r.status, notes: r.notes,
    enabled: r.enabled, verified: r.verified,
    secrets_masked: maskAll(secrets),
    created_at: r.created_at, updated_at: r.updated_at,
  };
}

// ---- Platforms -------------------------------------------------------------

export const listPlatforms = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Platform[]> => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { decryptJson } = await import("@/lib/integrations/crypto.server");
    const { data, error } = await (supabaseAdmin as any)
      .from("platforms").select("*").order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []).map((r: any) => rowToPlatform(
      r, r.secrets_ciphertext ? decryptJson<PlatformSecrets>(r.secrets_ciphertext) : {},
    ));
  });

const platformInput = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1).max(60).regex(/^[a-z0-9_-]+$/i),
  name: z.string().min(1).max(80),
  logo_url: z.string().max(500).nullable().optional(),
  description: z.string().max(500).nullable().optional(),
  category: z.string().max(60).nullable().optional(),
  base_url: z.string().max(300).nullable().optional(),
  api_version: z.string().max(30).nullable().optional(),
  auth_type: z.enum([
    "none", "api_key", "bearer", "basic", "jwt",
    "oauth2", "oauth2_pkce", "webhook_only", "custom",
  ]),
  authorization_url: z.string().max(300).nullable().optional(),
  token_url: z.string().max(300).nullable().optional(),
  refresh_url: z.string().max(300).nullable().optional(),
  redirect_uri: z.string().max(300).nullable().optional(),
  scopes: z.array(z.string().max(100)).default([]),
  webhook_endpoint: z.string().max(300).nullable().optional(),
  default_headers: z.record(z.string()).default({}),
  timeout_ms: z.number().int().min(1000).max(60000).default(10000),
  retry_count: z.number().int().min(0).max(10).default(0),
  rate_limit: z.record(z.any()).default({}),
  notes: z.string().max(2000).nullable().optional(),
  enabled: z.boolean().default(false),
  secrets_patch: z.record(z.string()).default({}),
});

export const upsertPlatform = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => platformInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { encryptJson, decryptJson } = await import("@/lib/integrations/crypto.server");

    let current: PlatformSecrets = {};
    if (data.id) {
      const { data: ex } = await (supabaseAdmin as any).from("platforms")
        .select("secrets_ciphertext").eq("id", data.id).maybeSingle();
      if (ex?.secrets_ciphertext) current = decryptJson<PlatformSecrets>(ex.secrets_ciphertext);
    }
    const next: PlatformSecrets = { ...current };
    for (const [k, v] of Object.entries(data.secrets_patch)) {
      const key = k as SecretField;
      if (!SECRET_FIELDS.includes(key)) continue;
      if (v === "") delete next[key];
      else if (v && v.trim()) next[key] = v.trim();
    }

    const row = {
      id: data.id,
      slug: data.slug, name: data.name,
      logo_url: data.logo_url ?? null,
      description: data.description ?? null,
      category: data.category ?? null,
      base_url: data.base_url ?? null,
      api_version: data.api_version ?? null,
      auth_type: data.auth_type,
      authorization_url: data.authorization_url ?? null,
      token_url: data.token_url ?? null,
      refresh_url: data.refresh_url ?? null,
      redirect_uri: data.redirect_uri ?? null,
      scopes: data.scopes,
      webhook_endpoint: data.webhook_endpoint ?? null,
      default_headers: data.default_headers,
      timeout_ms: data.timeout_ms,
      retry_count: data.retry_count,
      rate_limit: data.rate_limit,
      notes: data.notes ?? null,
      enabled: data.enabled,
      status: "needs_configuration",
      verified: false,
      secrets_ciphertext: encryptJson(next),
      created_by: context.userId,
    };
    const { data: saved, error } = await (supabaseAdmin as any)
      .from("platforms")
      .upsert(row, { onConflict: "id" })
      .select("id").maybeSingle();
    if (error) throw new Error(error.message);
    return { id: saved?.id as string };
  });

export const deletePlatform = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => ({ id: String(d.id) }))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await (supabaseAdmin as any)
      .from("platforms").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---- Endpoints -------------------------------------------------------------

export const listEndpoints = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { platform_id: string }) => ({ platform_id: String(d.platform_id) }))
  .handler(async ({ data, context }): Promise<PlatformEndpoint[]> => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await (supabaseAdmin as any)
      .from("platform_endpoints").select("*")
      .eq("platform_id", data.platform_id)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (rows ?? []) as PlatformEndpoint[];
  });

const endpointInput = z.object({
  id: z.string().uuid().optional(),
  platform_id: z.string().uuid(),
  name: z.string().min(1).max(80),
  http_method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]).default("GET"),
  path: z.string().min(1).max(500),
  headers: z.record(z.string()).default({}),
  query_params: z.record(z.string()).default({}),
  body: z.string().max(20000).nullable().optional(),
  auth_override: z.record(z.any()).default({}),
  pagination: z.record(z.any()).default({}),
  rate_limit: z.record(z.any()).default({}),
  parser: z.record(z.any()).default({}),
  validation: z.record(z.any()).default({}),
});

export const upsertEndpoint = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => endpointInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: saved, error } = await (supabaseAdmin as any)
      .from("platform_endpoints")
      .upsert({ ...data, body: data.body ?? null }, { onConflict: "id" })
      .select("id").maybeSingle();
    if (error) throw new Error(error.message);
    return { id: saved?.id as string };
  });

export const deleteEndpoint = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => ({ id: String(d.id) }))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await (supabaseAdmin as any)
      .from("platform_endpoints").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const cloneEndpoint = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => ({ id: String(d.id) }))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: src, error } = await (supabaseAdmin as any)
      .from("platform_endpoints").select("*").eq("id", data.id).maybeSingle();
    if (error) throw new Error(error.message);
    if (!src) throw new Error("Endpoint not found");
    const { id: _drop, created_at: _c, updated_at: _u, last_tested_at, last_status, ...rest } = src;
    void _drop; void _c; void _u; void last_tested_at; void last_status;
    const { data: saved, error: e2 } = await (supabaseAdmin as any)
      .from("platform_endpoints").insert({ ...rest, name: `${src.name} (copy)` })
      .select("id").maybeSingle();
    if (e2) throw new Error(e2.message);
    return { id: saved?.id as string };
  });

// ---- Endpoint tester -------------------------------------------------------

export const testEndpoint = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { endpoint_id: string }) => ({ endpoint_id: String(d.endpoint_id) }))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { decryptJson } = await import("@/lib/integrations/crypto.server");

    const { data: ep, error } = await (supabaseAdmin as any)
      .from("platform_endpoints").select("*, platforms(*)")
      .eq("id", data.endpoint_id).maybeSingle();
    if (error) throw new Error(error.message);
    if (!ep) throw new Error("Endpoint not found");
    const platform = ep.platforms;
    const secrets = platform.secrets_ciphertext
      ? decryptJson<PlatformSecrets>(platform.secrets_ciphertext) : {};

    const base = (platform.base_url ?? "").replace(/\/$/, "");
    const path = (ep.path ?? "/").replace(/^\/*/, "/");
    if (!base) throw new Error("Platform Base URL is required");

    const url = new URL(base + path);
    for (const [k, v] of Object.entries(ep.query_params ?? {})) {
      if (v) url.searchParams.set(k, String(v));
    }

    const headers = new Headers({ Accept: "application/json" });
    for (const [k, v] of Object.entries(platform.default_headers ?? {})) headers.set(k, String(v));
    for (const [k, v] of Object.entries(ep.headers ?? {})) headers.set(k, String(v));

    switch (platform.auth_type) {
      case "bearer":
      case "oauth2":
      case "oauth2_pkce":
      case "jwt":
        if (secrets.access_token) headers.set("Authorization", `Bearer ${secrets.access_token}`);
        break;
      case "api_key":
        if (secrets.api_key) headers.set("X-API-Key", secrets.api_key);
        break;
      case "basic":
        if (secrets.basic_username) {
          const token = Buffer.from(`${secrets.basic_username}:${secrets.basic_password ?? ""}`).toString("base64");
          headers.set("Authorization", `Basic ${token}`);
        }
        break;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), Math.max(1000, Math.min(30000, platform.timeout_ms ?? 10000)));
    const started = Date.now();
    let body: string | undefined;
    if (["POST", "PUT", "PATCH"].includes(ep.http_method) && ep.body) {
      body = ep.body;
      if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
    }

    let status = 0, ok = false, response: JsonLike = null;
    const requestSummary = { method: ep.http_method, url: url.toString(), headers: Object.fromEntries(headers), body: body ?? null };
    try {
      const res = await fetch(url.toString(), { method: ep.http_method, headers, body, signal: controller.signal });
      status = res.status; ok = res.ok;
      const text = await res.text();
      try { response = JSON.parse(text); } catch { response = text; }
    } catch (err) {
      response = { error: (err as Error).message };
    } finally {
      clearTimeout(timer);
    }
    const duration_ms = Date.now() - started;

    await (supabaseAdmin as any).from("platform_endpoints").update({
      last_tested_at: new Date().toISOString(),
      last_status: status,
      example_response: response,
    }).eq("id", ep.id);

    return { ok, status, duration_ms, request: requestSummary, response };
  });

// ---- Field mappings --------------------------------------------------------

export const listMappings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { platform_id: string }) => ({ platform_id: String(d.platform_id) }))
  .handler(async ({ data, context }): Promise<FieldMapping[]> => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await (supabaseAdmin as any)
      .from("platform_field_mappings").select("*")
      .eq("platform_id", data.platform_id)
      .order("ROTHME_kpi", { ascending: true });
    if (error) throw new Error(error.message);
    return (rows ?? []) as FieldMapping[];
  });

const mappingInput = z.object({
  id: z.string().uuid().optional(),
  platform_id: z.string().uuid(),
  endpoint_id: z.string().uuid().nullable().optional(),
  ROTHME_kpi: z.string().min(1).max(60),
  json_path: z.string().max(300).default(""),
  data_type: z.enum(["number", "percent", "currency", "duration", "string", "boolean"]).default("number"),
  category: z.string().max(60).nullable().optional(),
  formatting: z.string().max(60).nullable().optional(),
  aggregation: z.string().max(30).nullable().optional(),
  calculation_formula: z.string().max(300).nullable().optional(),
  display_name: z.string().max(80).nullable().optional(),
  chart_type: z.string().max(30).nullable().optional(),
  unit: z.string().max(30).nullable().optional(),
  description: z.string().max(300).nullable().optional(),
  example_value: z.any().nullable().optional(),
  confirmed: z.boolean().default(false),
});

export const upsertMapping = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => mappingInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await (supabaseAdmin as any)
      .from("platform_field_mappings")
      .upsert(data, { onConflict: "platform_id,ROTHME_kpi" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteMapping = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => ({ id: String(d.id) }))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await (supabaseAdmin as any)
      .from("platform_field_mappings").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Map a clicked JSON path to a KPI in one call — used by the JSON mapper. */
export const mapPathToKpi = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: {
    platform_id: string; endpoint_id: string;
    ROTHME_kpi: string; json_path: string;
    example_response?: unknown;
  }) => ({
    platform_id: String(d.platform_id),
    endpoint_id: String(d.endpoint_id),
    ROTHME_kpi: String(d.ROTHME_kpi),
    json_path: String(d.json_path),
    example_response: d.example_response ?? null,
  }))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const example_value = readJsonPath(data.example_response, data.json_path) ?? null;
    const { error } = await (supabaseAdmin as any)
      .from("platform_field_mappings")
      .upsert({
        platform_id: data.platform_id,
        endpoint_id: data.endpoint_id,
        ROTHME_kpi: data.ROTHME_kpi,
        json_path: data.json_path,
        example_value,
        confirmed: false,
      }, { onConflict: "platform_id,ROTHME_kpi" });
    if (error) throw new Error(error.message);
    return { ok: true, example_value };
  });
