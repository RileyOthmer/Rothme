/**
 * Server functions for the Social Integration Framework.
 * Client-safe module — every handler loads server-only deps inside.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const platformSchema = z.enum([
  "instagram", "facebook", "threads", "tiktok", "linkedin",
  "x", "youtube", "pinterest", "bluesky", "mastodon", "gbp",
]);

/** List connections for the active org (RLS scoped). */
export const listSocialConnections = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { orgId: string }) => z.object({ orgId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("social_connections")
      .select("id, platform, status, health_score, health_updated_at, last_synced_at, last_error_kind, last_error_message, external_handle, external_account_id, created_at")
      .eq("org_id", data.orgId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

/** Recent audit events for the active org. */
export const listSocialEvents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { orgId: string; limit?: number }) =>
    z.object({ orgId: z.string().uuid(), limit: z.number().min(1).max(200).optional() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("social_events")
      .select("id, level, scope, event, data, connection_id, platform, created_at")
      .eq("org_id", data.orgId)
      .order("created_at", { ascending: false })
      .limit(data.limit ?? 50);
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

/** Manually trigger a health/sync check for one connection. */
export const pingSocialConnection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { connectionId: string }) =>
    z.object({ connectionId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    // Verify caller can see this connection under RLS (org-membership scoped).
    const { data: row, error: lookupErr } = await context.supabase
      .from("social_connections")
      .select("id")
      .eq("id", data.connectionId)
      .maybeSingle();
    if (lookupErr) throw new Error(lookupErr.message);
    if (!row) throw new Error("Connection not found");

    const { getIntegrationManager } = await import("./manager.server");
    const { recordHealth } = await import("./store.server");
    const mgr = await getIntegrationManager();
    const end = new Date();
    const start = new Date(end.getTime() - 24 * 3600_000);
    try {
      const snaps = await mgr.sync.syncAnalytics(data.connectionId, {
        start: start.toISOString(), end: end.toISOString(),
      });
      await recordHealth(data.connectionId, { ok: true });
      return { ok: true, snapshots: snaps.length };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      await recordHealth(data.connectionId, { ok: false, message: msg });
      return { ok: false, error: msg };
    }
  });


export const socialPlatforms = platformSchema.options;
