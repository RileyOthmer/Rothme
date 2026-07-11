import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";
import { generateWeeklyReport, weekStartFor } from "@/lib/reports-mock";

/**
 * Monday-morning cron endpoint.
 *
 * Scheduled via pg_cron to fire every Monday at 07:00 UTC. It ensures every
 * user has this week's weekly report row in `weekly_reports`. Idempotent —
 * safe to re-run any time on any day.
 *
 * When real Data Engine adapters ship, swap `generateWeeklyReport(week)` for
 * a call that reads from `getMetrics()` and asks the AI strategist for the
 * consultant narrative. The row shape (WeeklyReportPayload) stays the same.
 */
export const Route = createFileRoute("/api/public/hooks/generate-weekly-reports")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Simple auth: caller must present the Supabase anon key as `apikey`.
        // pg_cron already sends this. Anyone else gets 401.
        const anon = request.headers.get("apikey");
        const expected = process.env.SUPABASE_PUBLISHABLE_KEY;
        if (!anon || !expected || anon !== expected) {
          return new Response(
            JSON.stringify({ error: "Unauthorized" }),
            { status: 401, headers: { "Content-Type": "application/json" } },
          );
        }

        const url = process.env.SUPABASE_URL;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!url || !serviceKey) {
          return new Response(
            JSON.stringify({ error: "Server not configured" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }

        const admin = createClient<Database>(url, serviceKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        });

        const weekStart = weekStartFor(0); // current Monday

        // Fetch every onboarded user — we only report for people who set up
        // their profile. This keeps blank rows out of the reports list.
        const { data: profiles, error: profErr } = await admin
          .from("profiles")
          .select("id")
          .not("onboarded_at", "is", null);

        if (profErr) {
          console.error("[weekly-reports] profile lookup failed", profErr);
          return new Response(
            JSON.stringify({ error: profErr.message }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }

        const userIds = (profiles ?? []).map((p) => p.id);
        if (userIds.length === 0) {
          return Response.json({ generated: 0, week_start: weekStart });
        }

        // Skip users who already have this week's report.
        const { data: existing } = await admin
          .from("weekly_reports")
          .select("user_id")
          .eq("week_start", weekStart)
          .in("user_id", userIds);

        const have = new Set((existing ?? []).map((r) => r.user_id));
        const missing = userIds.filter((id) => !have.has(id));

        if (missing.length === 0) {
          return Response.json({
            generated: 0,
            week_start: weekStart,
            note: "Already generated for everyone.",
          });
        }

        // One report per missing user — same seed per week, so runs are stable.
        const rows = missing.map((user_id) => ({
          user_id,
          week_start: weekStart,
          payload: generateWeeklyReport(weekStart),
        }));

        const { error: insErr } = await admin
          .from("weekly_reports")
          .insert(rows);

        if (insErr) {
          console.error("[weekly-reports] insert failed", insErr);
          return new Response(
            JSON.stringify({ error: insErr.message }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }

        return Response.json({
          generated: rows.length,
          week_start: weekStart,
        });
      },
    },
  },
});
