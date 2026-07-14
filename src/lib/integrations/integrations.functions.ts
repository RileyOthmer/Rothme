// Admin-only server functions for the Developer Integration Center.
// Every function verifies the caller has the 'admin' role.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  PLATFORMS, SECRET_FIELDS,
  type IntegrationConfig, type IntegrationLog, type IntegrationRow,
  type IntegrationSecrets, type KpiMapping, type PlatformId,
} from "./types";

// ---- helpers ---------------------------------------------------------------

async function assertAdmin(ctx: { supabase: any; userId: string }) {
  const { data, error } = await ctx.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", ctx.userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin only");
}

async function logEvent(
  platform: string,
  event_type: string,
  fields: {
    success?: boolean | null;
    status_code?: number | null;
    message?: string | null;
    request?: unknown;
    response?: unknown;
    actor?: string;
  },
) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  await supabaseAdmin.from("platform_integration_logs").insert({
    platform,
    event_type,
    success: fields.success ?? null,
    status_code: fields.status_code ?? null,
    message: fields.message ?? null,
    request: (fields.request ?? null) as any,
    response: (fields.response ?? null) as any,
    actor: fields.actor ?? null,
  });
}

function maskAll(secrets: IntegrationSecrets) {
  const out: Partial<Record<keyof IntegrationSecrets, string>> = {};
  for (const f of SECRET_FIELDS) {
    const v = secrets[f.id];
    if (!v) continue;
    out[f.id] = v.length <= 6 ? "••••" : "•".repeat(Math.max(4, v.length - 4)) + v.slice(-4);
  }
  return out;
}

const PLATFORM_LABELS = Object.fromEntries(PLATFORMS.map((p) => [p.id, p.label]));

// ---- claim_first_admin (public but self-guarded) --------------------------

export const claimFirstAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("claim_first_admin");
    if (error) throw new Error(error.message);
    return { claimed: Boolean(data) };
  });

export const isAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (error) throw new Error(error.message);
    return { isAdmin: Boolean(data) };
  });

// ---- list / get integrations ----------------------------------------------

export const listIntegrations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<IntegrationRow[]> => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { decryptJson } = await import("./crypto.server");
    const { data, error } = await supabaseAdmin
      .from("platform_integrations")
      .select("*");
    if (error) throw new Error(error.message);

    const rows = new Map<string, any>((data ?? []).map((r) => [r.platform, r]));
    // Return one row per known platform, even if not saved yet.
    return PLATFORMS.map((p) => {
      const r = rows.get(p.id);
      const secrets = r?.secrets_ciphertext ? decryptJson<IntegrationSecrets>(r.secrets_ciphertext) : {};
      return {
        platform: p.id,
        display_name: r?.display_name ?? p.label,
        enabled: Boolean(r?.enabled),
        verified: Boolean(r?.verified),
        status: (r?.status ?? "draft") as IntegrationRow["status"],
        status_message: r?.status_message ?? null,
        config: (r?.config ?? {}) as IntegrationConfig,
        secrets_masked: maskAll(secrets),
        last_tested_at: r?.last_tested_at ?? null,
        updated_at: r?.updated_at ?? new Date().toISOString(),
      };
    });
  });

// ---- upsert (save) integration --------------------------------------------

const upsertSchema = z.object({
  platform: z.string().min(1),
  display_name: z.string().min(1).max(80),
  enabled: z.boolean().default(false),
  config: z.record(z.any()).default({}),
  // Only fields the admin actually typed are updated; empty string clears.
  secrets_patch: z.record(z.string()).default({}),
});

export const upsertIntegration = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => upsertSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { encryptJson, decryptJson } = await import("./crypto.server");

    const { data: existing } = await supabaseAdmin
      .from("platform_integrations")
      .select("secrets_ciphertext")
      .eq("platform", data.platform)
      .maybeSingle();

    const current: IntegrationSecrets = existing?.secrets_ciphertext
      ? decryptJson(existing.secrets_ciphertext)
      : {};
    const next: IntegrationSecrets = { ...current };
    for (const [k, v] of Object.entries(data.secrets_patch)) {
      const key = k as keyof IntegrationSecrets;
      if (v === "") delete next[key];
      else if (v && v.trim().length > 0) next[key] = v.trim();
    }

    const { error } = await supabaseAdmin
      .from("platform_integrations")
      .upsert({
        platform: data.platform,
        display_name: data.display_name,
        enabled: data.enabled,
        config: data.config,
        secrets_ciphertext: encryptJson(next),
        // Editing invalidates the previous verification.
        verified: false,
        status: "draft",
        status_message: null,
      }, { onConflict: "platform" });
    if (error) throw new Error(error.message);

    await logEvent(data.platform, "config_saved", {
      success: true,
      message: "Configuration saved",
      actor: context.userId,
    });
    return { ok: true };
  });

// ---- delete integration ---------------------------------------------------

export const deleteIntegration = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { platform: string }) => ({ platform: String(d.platform) }))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("platform_integrations")
      .delete()
      .eq("platform", data.platform);
    if (error) throw new Error(error.message);
    await logEvent(data.platform, "config_deleted", {
      success: true,
      actor: context.userId,
    });
    return { ok: true };
  });

// ---- KPI mappings ---------------------------------------------------------

export const listKpiMappings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { platform: string }) => ({ platform: String(d.platform) }))
  .handler(async ({ data, context }): Promise<KpiMapping[]> => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("platform_kpi_mappings")
      .select("*")
      .eq("platform", data.platform)
      .order("internal_kpi", { ascending: true });
    if (error) throw new Error(error.message);
    return (rows ?? []) as KpiMapping[];
  });

const kpiSchema = z.object({
  platform: z.string(),
  internal_kpi: z.string().min(1).max(60),
  external_field: z.string().max(200).default(""),
  data_type: z.enum(["number", "percent", "currency", "duration"]).default("number"),
  update_frequency: z.enum(["realtime", "hourly", "daily", "weekly"]).default("daily"),
  description: z.string().max(300).nullable().optional(),
  confirmed: z.boolean().default(false),
});

export const upsertKpiMapping = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => kpiSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("platform_kpi_mappings")
      .upsert(data, { onConflict: "platform,internal_kpi" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteKpiMapping = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => ({ id: String(d.id) }))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("platform_kpi_mappings")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---- Test connection / preview data ---------------------------------------

async function performHttpCall(
  platform: PlatformId,
  cfg: IntegrationConfig,
  secrets: IntegrationSecrets,
  overridePath?: string,
) {
  const base = (cfg.base_api_url || "").replace(/\/$/, "");
  const path = (overridePath ?? cfg.endpoint_path ?? "/").replace(/^\/*/, "/");
  if (!base) throw new Error("Base API URL is required");

  const url = new URL(base + path);
  for (const [k, v] of Object.entries(cfg.query_params ?? {})) {
    if (v) url.searchParams.set(k, v);
  }

  const headers = new Headers();
  headers.set("Accept", "application/json");
  for (const [k, v] of Object.entries(cfg.headers ?? {})) headers.set(k, v);

  switch (cfg.auth_method) {
    case "bearer":
    case "oauth2":
      if (secrets.access_token) headers.set("Authorization", `Bearer ${secrets.access_token}`);
      break;
    case "api_key":
      if (secrets.api_key) headers.set("X-API-Key", secrets.api_key);
      break;
    case "basic":
      if (secrets.client_id) {
        const token = Buffer.from(`${secrets.client_id}:${secrets.client_secret ?? ""}`).toString("base64");
        headers.set("Authorization", `Basic ${token}`);
      }
      break;
    default:
      break;
  }

  const method = cfg.http_method ?? "GET";
  const timeout = Math.max(1000, Math.min(30_000, cfg.timeout_ms ?? 10_000));
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  const started = Date.now();
  let body: string | undefined;
  if (method === "POST" && cfg.body_template) {
    body = cfg.body_template;
    if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  }

  try {
    const res = await fetch(url.toString(), { method, headers, body, signal: controller.signal });
    const text = await res.text();
    let parsed: import("./types").JsonLike = text;
    try { parsed = JSON.parse(text) as import("./types").JsonLike; } catch { /* keep as text */ }

    return {
      ok: res.ok,
      status: res.status,
      duration_ms: Date.now() - started,
      url: url.toString(),
      request: { method, headers: Object.fromEntries(headers), body: body ?? null },
      response: parsed,
    };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      duration_ms: Date.now() - started,
      url: url.toString(),
      request: { method, headers: Object.fromEntries(headers), body: body ?? null },
      response: { error: (err as Error).message },
    };
  } finally {
    clearTimeout(timer);
  }
}

export const testConnection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { platform: string }) => ({ platform: String(d.platform) }))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { decryptJson } = await import("./crypto.server");
    const { data: row, error } = await supabaseAdmin
      .from("platform_integrations")
      .select("*")
      .eq("platform", data.platform)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Save the configuration before testing");

    const cfg = (row.config ?? {}) as IntegrationConfig;
    const secrets = decryptJson<IntegrationSecrets>(row.secrets_ciphertext);
    const result = await performHttpCall(data.platform as PlatformId, cfg, secrets);

    const message = result.ok
      ? `HTTP ${result.status} in ${result.duration_ms}ms`
      : classifyFailure(result.status, result.response);

    await supabaseAdmin
      .from("platform_integrations")
      .update({
        last_tested_at: new Date().toISOString(),
        status: result.ok ? "tested" : "error",
        status_message: message,
      })
      .eq("platform", data.platform);

    await logEvent(data.platform, "test", {
      success: result.ok,
      status_code: result.status,
      message,
      request: result.request,
      response: result.response,
      actor: context.userId,
    });

    return { ...result, message };
  });

function classifyFailure(status: number, body: unknown): string {
  if (status === 0) return "Network error — request failed before reaching the API";
  if (status === 401) return "Authentication failed — token invalid or expired";
  if (status === 403) return "Permission denied — missing scope or permission";
  if (status === 404) return `Endpoint not found (HTTP 404)`;
  if (status === 429) return "Rate limit exceeded";
  if (status >= 500) return `Upstream server error (HTTP ${status})`;
  const msg = typeof body === "object" && body && "error" in (body as any)
    ? String((body as any).error)
    : `HTTP ${status}`;
  return msg;
}

export const previewData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { platform: string; path?: string }) => ({
    platform: String(d.platform), path: d.path ? String(d.path) : undefined,
  }))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { decryptJson } = await import("./crypto.server");
    const { data: row, error } = await supabaseAdmin
      .from("platform_integrations")
      .select("*")
      .eq("platform", data.platform)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Save the configuration first");

    const cfg = (row.config ?? {}) as IntegrationConfig;
    const secrets = decryptJson<IntegrationSecrets>(row.secrets_ciphertext);
    const result = await performHttpCall(data.platform as PlatformId, cfg, secrets, data.path);

    // Apply KPI mappings to build the parsed view.
    const { data: mappings } = await supabaseAdmin
      .from("platform_kpi_mappings")
      .select("*")
      .eq("platform", data.platform);

    const parsed: Record<string, import("./types").JsonLike> = {};
    for (const m of mappings ?? []) {
      parsed[m.internal_kpi] = readPath(result.response, m.external_field) as import("./types").JsonLike;
    }

    await logEvent(data.platform, "preview", {
      success: result.ok,
      status_code: result.status,
      message: result.ok ? "Preview OK" : "Preview failed",
      request: result.request,
      response: result.response,
      actor: context.userId,
    });

    return { ...result, parsed };
  });

function readPath(obj: unknown, path: string): unknown {
  if (!path) return undefined;
  const parts = path.split(/[.\[\]]/).filter(Boolean);
  let cur: any = obj;
  for (const p of parts) {
    if (cur == null) return undefined;
    cur = cur[p];
  }
  return cur;
}

// ---- Verify and enable ----------------------------------------------------

export const verifyAndEnable = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { platform: string }) => ({ platform: String(d.platform) }))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { decryptJson } = await import("./crypto.server");

    const { data: row } = await supabaseAdmin
      .from("platform_integrations").select("*")
      .eq("platform", data.platform).maybeSingle();
    if (!row) throw new Error("Save the configuration first");

    const cfg = (row.config ?? {}) as IntegrationConfig;
    const secrets = decryptJson<IntegrationSecrets>(row.secrets_ciphertext);

    // 1. Authentication check
    const call = await performHttpCall(data.platform as PlatformId, cfg, secrets);
    if (!call.ok) {
      const msg = classifyFailure(call.status, call.response);
      await supabaseAdmin.from("platform_integrations").update({
        status: "error", status_message: msg, verified: false, enabled: false,
      }).eq("platform", data.platform);
      await logEvent(data.platform, "verify", { success: false, status_code: call.status, message: msg, actor: context.userId });
      return { verified: false, reason: msg };
    }

    // 2. Required KPIs mapped
    const { data: mappings } = await supabaseAdmin
      .from("platform_kpi_mappings").select("internal_kpi, confirmed, external_field")
      .eq("platform", data.platform);
    const confirmed = (mappings ?? []).filter((m) => m.confirmed && m.external_field);
    if (confirmed.length === 0) {
      const msg = "No confirmed KPI mappings — map and confirm at least one KPI before enabling";
      await supabaseAdmin.from("platform_integrations").update({
        status: "error", status_message: msg, verified: false, enabled: false,
      }).eq("platform", data.platform);
      await logEvent(data.platform, "verify", { success: false, message: msg, actor: context.userId });
      return { verified: false, reason: msg };
    }

    // 3. Webhook secret required only if webhook_url is configured
    if (cfg.webhook_url && !secrets.webhook_secret) {
      const msg = "Webhook URL is configured but Webhook Secret is missing";
      await supabaseAdmin.from("platform_integrations").update({
        status: "error", status_message: msg, verified: false, enabled: false,
      }).eq("platform", data.platform);
      return { verified: false, reason: msg };
    }

    await supabaseAdmin.from("platform_integrations").update({
      status: "verified", verified: true, enabled: true,
      status_message: `Verified — HTTP ${call.status} in ${call.duration_ms}ms`,
      last_tested_at: new Date().toISOString(),
    }).eq("platform", data.platform);

    await logEvent(data.platform, "verify", {
      success: true, status_code: call.status,
      message: `Verified with ${confirmed.length} mapped KPI(s)`,
      actor: context.userId,
    });

    return { verified: true, message: `Verified — ${confirmed.length} KPI(s) enabled` };
  });

// ---- Logs -----------------------------------------------------------------

export const listLogs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { platform: string; limit?: number }) => ({
    platform: String(d.platform),
    limit: Math.min(Math.max(Number(d.limit) || 50, 1), 200),
  }))
  .handler(async ({ data, context }): Promise<IntegrationLog[]> => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("platform_integration_logs")
      .select("*")
      .eq("platform", data.platform)
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (error) throw new Error(error.message);
    return (rows ?? []) as IntegrationLog[];
  });
