/**
 * Supabase-backed SocialStore — persists connections + audit events for the
 * Social Integration Framework. Uses the service-role client because tokens
 * are stored encrypted (INTEGRATION_ENCRYPTION_KEY) and RLS is enforced at
 * the server-function boundary via requireSupabaseAuth + org membership.
 *
 * SERVER-ONLY. Never import from a client bundle.
 */
import { encryptJson, decryptJson } from "@/lib/integrations/crypto.server";
import type { ConnectionRow, LogEntry, SocialStore } from "./framework.server";
import type { SocialPlatformId, TokenSet } from "./types";

type AdminClient = Awaited<ReturnType<typeof getAdmin>>;

async function getAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

function rowToConnection(r: any): ConnectionRow {
  return {
    id: r.id,
    userId: r.user_id,
    orgId: r.org_id,
    platform: r.platform as SocialPlatformId,
    tokens: decryptJson<TokenSet>(r.tokens_ciphertext),
    externalAccountId: r.external_account_id ?? undefined,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export function createSupabaseSocialStore(): SocialStore {
  let adminPromise: Promise<AdminClient> | null = null;
  const admin = () => (adminPromise ??= getAdmin());

  return {
    async getConnection(id) {
      const db = await admin();
      const { data, error } = await db.from("social_connections").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data ? rowToConnection(data) : null;
    },

    async listConnections(orgId) {
      const db = await admin();
      const { data, error } = await db.from("social_connections").select("*").eq("org_id", orgId);
      if (error) throw error;
      return (data ?? []).map(rowToConnection);
    },

    async saveConnection(row) {
      const db = await admin();
      const payload = {
        id: row.id,
        org_id: row.orgId,
        user_id: row.userId,
        platform: row.platform,
        external_account_id: row.externalAccountId ?? null,
        tokens_ciphertext: encryptJson(row.tokens),
        status: "connected",
      };
      const { data, error } = await db
        .from("social_connections")
        .upsert(payload, { onConflict: "id" })
        .select("*")
        .single();
      if (error) throw error;
      return rowToConnection(data);
    },

    async updateTokens(id, tokens) {
      const db = await admin();
      const { error } = await db
        .from("social_connections")
        .update({ tokens_ciphertext: encryptJson(tokens), status: "connected", last_error_kind: null, last_error_message: null })
        .eq("id", id);
      if (error) throw error;
    },

    async deleteConnection(id) {
      const db = await admin();
      const { error } = await db.from("social_connections").delete().eq("id", id);
      if (error) throw error;
    },

    async logEvent(entry: LogEntry) {
      const db = await admin();
      const meta = (entry.data ?? {}) as Record<string, unknown>;
      await db.from("social_events").insert({
        org_id: (meta.orgId as string) ?? null,
        connection_id: (meta.connectionId as string) ?? null,
        platform: (meta.platform as string) ?? null,
        level: entry.level,
        scope: entry.scope,
        event: entry.event,
        data: meta,
        request_id: entry.requestId ?? null,
      });
    },
  };
}

/**
 * Update connection health after a sync/publish attempt.
 * Score decays on failures and recovers on success.
 */
export async function recordHealth(
  connectionId: string,
  outcome: { ok: boolean; errorKind?: string; message?: string },
): Promise<void> {
  const db = await getAdmin();
  const { data } = await db.from("social_connections").select("health_score").eq("id", connectionId).maybeSingle();
  const prev = data?.health_score ?? 100;
  const next = outcome.ok ? Math.min(100, prev + 10) : Math.max(0, prev - 25);
  await db
    .from("social_connections")
    .update({
      health_score: next,
      health_updated_at: new Date().toISOString(),
      last_synced_at: outcome.ok ? new Date().toISOString() : undefined,
      status: outcome.ok ? "connected" : next === 0 ? "error" : "degraded",
      last_error_kind: outcome.ok ? null : outcome.errorKind ?? "unknown",
      last_error_message: outcome.ok ? null : outcome.message ?? null,
    })
    .eq("id", connectionId);
}
