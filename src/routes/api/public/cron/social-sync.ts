/**
 * Background sync sweep — polls all social connections for fresh analytics.
 * Called by pg_cron (or external scheduler) on a ~15min cadence.
 * Auth: shared HMAC signature — caller sends `x-cron-signature` header
 * computed from CRON_SECRET.
 */
import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";

export const Route = createFileRoute("/api/public/cron/social-sync")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.CRON_SECRET;
        if (!secret) return new Response("CRON_SECRET not configured", { status: 500 });
        const provided = request.headers.get("x-cron-signature") ?? "";
        const expected = createHmac("sha256", secret).update("ROTHME-cron-social-sync").digest("hex");
        const a = Buffer.from(provided);
        const b = Buffer.from(expected);
        if (a.length !== b.length || !timingSafeEqual(a, b)) {
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
