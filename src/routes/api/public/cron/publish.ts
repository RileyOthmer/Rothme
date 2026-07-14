import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";

// Publishing scheduler — processes due schedules.
// Called by an external scheduler (pg_cron, GitHub Action, uptime pinger) at ~1min cadence.
// Auth: shared HMAC header — set CRON_SECRET to a random string in project secrets.

export const Route = createFileRoute("/api/public/cron/publish")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.CRON_SECRET;
        const provided = request.headers.get("x-cron-signature") ?? "";
        if (!secret) return new Response("CRON_SECRET not configured", { status: 500 });

        const expected = createHmac("sha256", secret).update("ROTHME-cron-publish").digest("hex");
        const a = Buffer.from(provided);
        const b = Buffer.from(expected);
        if (a.length !== b.length || !timingSafeEqual(a, b)) {
          return new Response("Unauthorized", { status: 401 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        // Grab a small batch of due schedules
        const now = new Date().toISOString();
        const { data: due, error } = await supabaseAdmin
          .from("post_schedules")
          .select("id, post_id, platform_id, scheduled_at, attempts")
          .eq("status", "pending")
          .lte("scheduled_at", now)
          .order("scheduled_at", { ascending: true })
          .limit(25);
        if (error) return Response.json({ ok: false, error: error.message }, { status: 500 });

        const results: any[] = [];
        for (const item of due ?? []) {
          // Mark publishing
          await supabaseAdmin
            .from("post_schedules")
            .update({ status: "publishing", attempts: (item.attempts ?? 0) + 1 })
            .eq("id", item.id);

          try {
            // Plugin dispatch happens here. For now we mark as published with a stub URL.
            // Real platform plugins subscribe by module="publish" and consume the schedule.
            const externalUrl = `https://plugins.ROTHME/${item.platform_id}/pending`;
            await supabaseAdmin
              .from("post_schedules")
              .update({
                status: "published",
                published_at: new Date().toISOString(),
                external_url: externalUrl,
              })
              .eq("id", item.id);
            await supabaseAdmin.from("posts").update({ status: "published" }).eq("id", item.post_id);
            results.push({ id: item.id, ok: true });
          } catch (e: any) {
            await supabaseAdmin
              .from("post_schedules")
              .update({ status: "failed", error: String(e?.message ?? e) })
              .eq("id", item.id);
            results.push({ id: item.id, ok: false, error: String(e?.message ?? e) });
          }
        }

        return Response.json({ ok: true, processed: results.length, results });
      },
    },
  },
});
