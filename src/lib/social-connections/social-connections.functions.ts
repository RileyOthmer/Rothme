/**
 * Server functions for the Social Connections framework.
 * Client-safe module — every handler loads server-only deps inside.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { randomBytes } from "node:crypto";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { PLATFORMS, getPlatform, type PlatformId } from "./platforms";

const platformSchema = z.enum(
  PLATFORMS.map((p) => p.id) as [PlatformId, ...PlatformId[]],
);

// ---------- Platform capability list (safe for UI) ----------

export const listPlatformStatuses = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    return PLATFORMS.map((p) => ({
      id: p.id,
      configured: Boolean(process.env[p.clientIdEnv] && process.env[p.clientSecretEnv]),
    }));
  });

// ---------- List the user's connected accounts ----------

export const listSocialAccounts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("social_accounts")
      .select(
        "id, platform, platform_account_id, username, display_name, avatar_url, scopes, connection_status, last_error, connected_at, last_sync, token_expiration",
      )
      .eq("user_id", context.userId)
      .order("connected_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

// ---------- Start Connect: build authorize URL, save state ----------

export const startConnect = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { platform: PlatformId; origin: string }) =>
    z.object({ platform: platformSchema, origin: z.string().url() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const cfg = getPlatform(data.platform);
    if (!cfg) throw new Error("Unknown platform");
    if (cfg.availability !== "available") {
      return {
        ok: false as const,
        awaitingCredentials: true as const,
        message: `${cfg.name} isn't available yet — it's on the Coming Soon list. We'll enable it in a future release.`,
        docsUrl: cfg.docsUrl,
      };
    }
    if (!process.env[cfg.clientIdEnv] || !process.env[cfg.clientSecretEnv]) {
      return {
        ok: false as const,
        awaitingCredentials: true as const,
        message: `${cfg.name} is awaiting developer credentials. Add ${cfg.clientIdEnv} and ${cfg.clientSecretEnv} to enable this connection.`,
        docsUrl: cfg.docsUrl,
      };
    }
    const { getAdapter } = await import("./adapter.server");
    const adapter = getAdapter(data.platform);
    const redirectUri = `${data.origin}/api/public/oauth/${data.platform}/callback`;
    const state = randomBytes(24).toString("hex");
    const { url, codeVerifier } = await adapter.authorize({
      userId: context.userId,
      redirectUri,
      state,
    });
    const { error } = await context.supabase.from("oauth_states").insert({
      state,
      user_id: context.userId,
      platform: data.platform,
      code_verifier: codeVerifier ?? null,
    });
    if (error) throw new Error(error.message);
    return { ok: true as const, awaitingCredentials: false as const, authorizeUrl: url };
  });

// ---------- Disconnect ----------

export const disconnectAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { accountId: string }) =>
    z.object({ accountId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    // Look up the account so we can attempt token revocation before delete.
    const { data: row, error: readErr } = await context.supabase
      .from("social_accounts")
      .select("id, platform, encrypted_access_token")
      .eq("id", data.accountId)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (readErr) throw new Error(readErr.message);
    if (!row) throw new Error("Account not found");

    if (row.encrypted_access_token) {
      try {
        const { decryptJson } = await import("@/lib/integrations/crypto.server");
        const { getAdapter } = await import("./adapter.server");
        const bundle = decryptJson<{ accessToken?: string }>(row.encrypted_access_token);
        if (bundle.accessToken) {
          await getAdapter(row.platform).revokeToken({ accessToken: bundle.accessToken });
        }
      } catch {
        // Non-fatal — provider may already have revoked it.
      }
    }

    const { error: delErr } = await context.supabase
      .from("social_accounts")
      .delete()
      .eq("id", data.accountId)
      .eq("user_id", context.userId);
    if (delErr) throw new Error(delErr.message);
    return { ok: true };
  });

// ---------- Refresh token ----------

export const refreshAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { accountId: string }) =>
    z.object({ accountId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("social_accounts")
      .select("id, platform, encrypted_refresh_token")
      .eq("id", data.accountId)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Account not found");
    if (!row.encrypted_refresh_token) {
      return { ok: false as const, message: "No refresh token stored for this account." };
    }
    const { decryptJson, encryptJson } = await import("@/lib/integrations/crypto.server");
    const { getAdapter } = await import("./adapter.server");
    const stored = decryptJson<{ refreshToken?: string }>(row.encrypted_refresh_token);
    if (!stored.refreshToken) return { ok: false as const, message: "Refresh token unavailable." };
    try {
      const bundle = await getAdapter(row.platform).refreshToken({ refreshToken: stored.refreshToken });
      const expiresAt = bundle.expiresIn ? new Date(Date.now() + bundle.expiresIn * 1000).toISOString() : null;
      const { error: upErr } = await context.supabase
        .from("social_accounts")
        .update({
          encrypted_access_token: encryptJson({ accessToken: bundle.accessToken }),
          encrypted_refresh_token: bundle.refreshToken
            ? encryptJson({ refreshToken: bundle.refreshToken })
            : row.encrypted_refresh_token,
          token_expiration: expiresAt,
          connection_status: "connected",
          last_error: null,
        })
        .eq("id", data.accountId)
        .eq("user_id", context.userId);
      if (upErr) throw new Error(upErr.message);
      return { ok: true as const };
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      await context.supabase
        .from("social_accounts")
        .update({ connection_status: "needs_reauth", last_error: message })
        .eq("id", data.accountId)
        .eq("user_id", context.userId);
      return { ok: false as const, message };
    }
  });

// ---------- Manual sync ----------

export const triggerSync = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { accountId: string; kind?: "profile" | "analytics" | "full" }) =>
    z
      .object({
        accountId: z.string().uuid(),
        kind: z.enum(["profile", "analytics", "full"]).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const kind = data.kind ?? "full";
    const { data: row, error } = await context.supabase
      .from("social_accounts")
      .select("id, platform, platform_account_id, encrypted_access_token")
      .eq("id", data.accountId)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Account not found");

    const { data: syncRow, error: syncInsertErr } = await context.supabase
      .from("sync_history")
      .insert({
        social_account_id: row.id,
        user_id: context.userId,
        kind,
      })
      .select("id")
      .single();
    if (syncInsertErr) throw new Error(syncInsertErr.message);

    await context.supabase
      .from("social_accounts")
      .update({ connection_status: "syncing" })
      .eq("id", row.id)
      .eq("user_id", context.userId);

    let success = false;
    let errorMessage: string | null = null;
    let records = 0;
    try {
      if (!row.encrypted_access_token) throw new Error("No access token stored");
      const { decryptJson } = await import("@/lib/integrations/crypto.server");
      const { getAdapter } = await import("./adapter.server");
      const bundle = decryptJson<{ accessToken?: string }>(row.encrypted_access_token);
      if (!bundle.accessToken) throw new Error("Access token missing");
      const adapter = getAdapter(row.platform);
      if (kind === "profile" || kind === "full") {
        const profile = await adapter.syncProfile({ accessToken: bundle.accessToken });
        if (profile.platformAccountId) {
          await context.supabase
            .from("social_accounts")
            .update({
              username: profile.username,
              display_name: profile.displayName,
              avatar_url: profile.avatarUrl,
              platform_account_id: profile.platformAccountId,
            })
            .eq("id", row.id)
            .eq("user_id", context.userId);
        }
        records += 1;
      }
      if (kind === "analytics" || kind === "full") {
        const result = await adapter.syncAnalytics({
          accessToken: bundle.accessToken,
          platformAccountId: row.platform_account_id,
        });
        records += result.records;
      }
      success = true;
    } catch (e) {
      errorMessage = e instanceof Error ? e.message : String(e);
    }

    await context.supabase
      .from("sync_history")
      .update({
        completed_at: new Date().toISOString(),
        success,
        records_synced: records,
        error_message: errorMessage,
      })
      .eq("id", syncRow.id);

    await context.supabase
      .from("social_accounts")
      .update({
        connection_status: success ? "connected" : "error",
        last_sync: new Date().toISOString(),
        last_error: errorMessage,
      })
      .eq("id", row.id)
      .eq("user_id", context.userId);

    return { ok: success, records, error: errorMessage };
  });

// ---------- Sync history for an account ----------

export const listSyncHistory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { accountId: string; limit?: number }) =>
    z.object({ accountId: z.string().uuid(), limit: z.number().min(1).max(100).optional() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("sync_history")
      .select("id, kind, started_at, completed_at, success, records_synced, error_message")
      .eq("social_account_id", data.accountId)
      .eq("user_id", context.userId)
      .order("started_at", { ascending: false })
      .limit(data.limit ?? 25);
    if (error) throw new Error(error.message);
    return rows ?? [];
  });
