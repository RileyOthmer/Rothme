/**
 * Background sync sweep — polls all social connections for fresh analytics.
 * Called by pg_cron (or external scheduler) on a ~15min cadence.
 * Auth: Supabase publishable key in `apikey` header (public route bypasses
 * app auth; we still gate the sweep here).
 */
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/cron/social-sync")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = request.headers.get("apikey") ?? "";
        const expected = process.env.SUPABASE_PUBLISHABLE_KEY ?? "";
        if (!expected || key !== expected) {
          return new Response("Unauthorized", { status: 401 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { getIntegrationManager } = await import("@/lib/social/manager.server");
        const { recordHealth } = await import("@/lib/social/store.server");

        // Pull every org that has at least one connection.
        const { data: orgs, error } = await supabaseAdmin
          .from("social_connections")
          .select("org_id")
          .limit(500);
        if (error) return Response.json({ ok: false, error: error.message }, { status: 500 });

        const orgIds = [...new Set((orgs ?? []).map((r: any) => r.org_id as string))];
        const mgr = await getIntegrationManager();

        const end = new Date();
        const start = new Date(end.getTime() - 24 * 3600_000);
        const range = { start: start.toISOString(), end: end.toISOString() };

        let processed = 0;
        let healed = 0;
        let failed = 0;

        for (const orgId of orgIds) {
          const { data: conns } = await supabaseAdmin
            .from("social_connections")
            .select("id")
            .eq("org_id", orgId);
          for (const c of conns ?? []) {
            try {
              const snaps = await mgr.sync.syncAnalytics((c as any).id, range);
              await recordHealth((c as any).id, { ok: true });
              healed++;
              processed += snaps.length;
            } catch (e) {
              failed++;
              await recordHealth((c as any).id, {
                ok: false,
                message: e instanceof Error ? e.message : String(e),
              });
            }
          }
        }

        return Response.json({ ok: true, orgs: orgIds.length, healed, failed, snapshots: processed });
      },
    },
  },
});
