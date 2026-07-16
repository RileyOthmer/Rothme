/**
 * Admin stats aggregates. Uses supabaseAdmin (bypasses RLS) so counts are
 * true totals, but every handler asserts the caller is an admin.
 */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { PLATFORMS } from "@/lib/social-connections/platforms";

async function assertAdmin(ctx: { supabase: { rpc: (n: string, a: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }> }; userId: string }) {
  const { data, error } = await ctx.supabase.rpc("has_role", { _user_id: ctx.userId, _role: "admin" });
  if (error || data !== true) throw new Error("Forbidden");
}

const DAY = 24 * 60 * 60 * 1000;
const isoDaysAgo = (n: number) => new Date(Date.now() - n * DAY).toISOString();

export const getUserStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [{ count: total }, { count: last7 }, { count: last30 }] = await Promise.all([
      supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", isoDaysAgo(7)),
      supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", isoDaysAgo(30)),
    ]);

    const { data: recent } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, avatar_url, created_at")
      .order("created_at", { ascending: false })
      .limit(15);

    return {
      total: total ?? 0,
      newLast7: last7 ?? 0,
      newLast30: last30 ?? 0,
      recent: recent ?? [],
    };
  });

export const getRevenueStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { environment?: "sandbox" | "live" }) => d ?? {})
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const env = data.environment ?? "live";

    const base = supabaseAdmin.from("subscriptions").select("*", { count: "exact" }).eq("environment", env);

    const [{ data: rows, count: total }, { count: active }, { count: trialing }, { count: pastDue }, { count: canceled }] = await Promise.all([
      supabaseAdmin
        .from("subscriptions")
        .select("id, status, plan_id, price_id, amount, currency, current_period_end, cancel_at_period_end, user_id, updated_at")
        .eq("environment", env)
        .order("updated_at", { ascending: false })
        .limit(20),
      base.eq("status", "active"),
      supabaseAdmin.from("subscriptions").select("id", { count: "exact", head: true }).eq("environment", env).eq("status", "trialing"),
      supabaseAdmin.from("subscriptions").select("id", { count: "exact", head: true }).eq("environment", env).eq("status", "past_due"),
      supabaseAdmin.from("subscriptions").select("id", { count: "exact", head: true }).eq("environment", env).eq("status", "canceled"),
    ]);

    // Naive MRR: sum of `amount` for active subs, assume monthly cents.
    const { data: activeRows } = await supabaseAdmin
      .from("subscriptions")
      .select("amount, currency, plan_id")
      .eq("environment", env)
      .eq("status", "active");
    let mrrCents = 0;
    const byPlan = new Map<string, number>();
    for (const r of (activeRows ?? []) as { amount: number | null; plan_id: string | null }[]) {
      const a = Number(r.amount ?? 0);
      if (Number.isFinite(a)) mrrCents += a;
      const plan = r.plan_id ?? "unknown";
      byPlan.set(plan, (byPlan.get(plan) ?? 0) + 1);
    }

    return {
      environment: env,
      total: total ?? 0,
      active: active ?? 0,
      trialing: trialing ?? 0,
      pastDue: pastDue ?? 0,
      canceled: canceled ?? 0,
      mrrCents,
      byPlan: Array.from(byPlan.entries()).map(([plan, count]) => ({ plan, count })),
      recent: rows ?? [],
    };
  });

export const getConnectionStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: accounts } = await supabaseAdmin
      .from("social_accounts")
      .select("platform, status, expires_at");

    type Row = { platform: string; status: string | null; expires_at: string | null };
    const rows = (accounts ?? []) as Row[];
    const byPlatform: Record<string, { total: number; connected: number; degraded: number; disconnected: number; expiringSoon: number }> = {};
    for (const p of PLATFORMS) byPlatform[p.id] = { total: 0, connected: 0, degraded: 0, disconnected: 0, expiringSoon: 0 };
    const soon = Date.now() + 7 * DAY;
    for (const r of rows) {
      const b = byPlatform[r.platform] ?? (byPlatform[r.platform] = { total: 0, connected: 0, degraded: 0, disconnected: 0, expiringSoon: 0 });
      b.total++;
      if (r.status === "connected") b.connected++;
      else if (r.status === "degraded" || r.status === "needs_reauth") b.degraded++;
      else b.disconnected++;
      if (r.expires_at && new Date(r.expires_at).getTime() < soon) b.expiringSoon++;
    }

    const { data: syncs } = await supabaseAdmin
      .from("sync_history")
      .select("status, created_at")
      .gte("created_at", isoDaysAgo(7));
    const syncRows = (syncs ?? []) as { status: string | null }[];
    const ok = syncRows.filter((s) => s.status === "success").length;
    const fail = syncRows.filter((s) => s.status === "error" || s.status === "failed").length;

    return {
      platforms: PLATFORMS.map((p) => ({
        id: p.id,
        name: p.name,
        brandColor: p.brandColor,
        mark: p.mark,
        ...byPlatform[p.id],
      })),
      syncs7d: { success: ok, failed: fail, total: syncRows.length },
    };
  });

export const getHealthStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [{ data: syncErrors }, { data: pluginEvents }, { data: integrationLogs }, { count: aiAudits }] = await Promise.all([
      supabaseAdmin
        .from("sync_history")
        .select("id, platform, status, error_message, created_at")
        .in("status", ["error", "failed"])
        .order("created_at", { ascending: false })
        .limit(15),
      supabaseAdmin
        .from("plugin_events")
        .select("id, plugin_id, level, message, created_at")
        .order("created_at", { ascending: false })
        .limit(15),
      supabaseAdmin
        .from("platform_integration_logs")
        .select("id, platform_id, level, message, created_at")
        .order("created_at", { ascending: false })
        .limit(15),
      supabaseAdmin
        .from("ai_audits")
        .select("id", { count: "exact", head: true })
        .gte("created_at", isoDaysAgo(7)),
    ]);

    return {
      syncErrors: syncErrors ?? [],
      pluginEvents: pluginEvents ?? [],
      integrationLogs: integrationLogs ?? [],
      aiAudits7d: aiAudits ?? 0,
    };
  });
