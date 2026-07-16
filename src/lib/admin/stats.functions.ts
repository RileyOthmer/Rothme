/**
 * Admin stats aggregates. Uses supabaseAdmin (bypasses RLS) so counts are
 * true totals, but every handler asserts the caller is an admin.
 */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { PLATFORMS } from "@/lib/social-connections/platforms";

async function assertAdmin(userId: string): Promise<void> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("id")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error || !data) throw new Error("Forbidden");
}

const DAY = 24 * 60 * 60 * 1000;
const isoDaysAgo = (n: number) => new Date(Date.now() - n * DAY).toISOString();

export const getUserStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [{ count: total }, { count: last7 }, { count: last30 }] = await Promise.all([
      supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", isoDaysAgo(7)),
      supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", isoDaysAgo(30)),
    ]);

    const { data: recent } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, business_name, created_at")
      .order("created_at", { ascending: false })
      .limit(15);

    return {
      total: total ?? 0,
      newLast7: last7 ?? 0,
      newLast30: last30 ?? 0,
      recent: (recent ?? []) as Array<{ id: string; full_name: string | null; business_name: string | null; created_at: string }>,
    };
  });

export const getRevenueStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { environment?: "sandbox" | "live" }) => d ?? {})
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const env = data.environment ?? "live";

    const [{ count: total }, { count: active }, { count: trialing }, { count: pastDue }, { count: canceled }, { data: rows }, { data: activeRows }] = await Promise.all([
      supabaseAdmin.from("subscriptions").select("id", { count: "exact", head: true }).eq("environment", env),
      supabaseAdmin.from("subscriptions").select("id", { count: "exact", head: true }).eq("environment", env).eq("status", "active"),
      supabaseAdmin.from("subscriptions").select("id", { count: "exact", head: true }).eq("environment", env).eq("status", "trialing"),
      supabaseAdmin.from("subscriptions").select("id", { count: "exact", head: true }).eq("environment", env).eq("status", "past_due"),
      supabaseAdmin.from("subscriptions").select("id", { count: "exact", head: true }).eq("environment", env).eq("status", "canceled"),
      supabaseAdmin
        .from("subscriptions")
        .select("id, status, plan, billing_cycle, price_id, customer_email, current_period_end, cancel_at_period_end, updated_at")
        .eq("environment", env)
        .order("updated_at", { ascending: false })
        .limit(20),
      supabaseAdmin
        .from("subscriptions")
        .select("plan, billing_cycle")
        .eq("environment", env)
        .eq("status", "active"),
    ]);

    const byPlan = new Map<string, number>();
    for (const r of ((activeRows ?? []) as Array<{ plan: string | null; billing_cycle: string | null }>)) {
      const key = `${r.plan ?? "unknown"} · ${r.billing_cycle ?? "monthly"}`;
      byPlan.set(key, (byPlan.get(key) ?? 0) + 1);
    }

    return {
      environment: env,
      total: total ?? 0,
      active: active ?? 0,
      trialing: trialing ?? 0,
      pastDue: pastDue ?? 0,
      canceled: canceled ?? 0,
      byPlan: Array.from(byPlan.entries()).map(([label, count]) => ({ label, count })),
      recent: (rows ?? []) as unknown as Array<{
        id: string;
        status: string | null;
        plan: string | null;
        billing_cycle: string | null;
        price_id: string | null;
        customer_email: string | null;
        current_period_end: string | null;
        cancel_at_period_end: boolean | null;
        updated_at: string | null;
      }>,
    };
  });

export const getConnectionStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: accounts } = await supabaseAdmin
      .from("social_accounts")
      .select("platform, connection_status, token_expiration");

    type Row = { platform: string; connection_status: string | null; token_expiration: string | null };
    const rows = (accounts ?? []) as unknown as Row[];
    const byPlatform: Record<string, { total: number; connected: number; degraded: number; disconnected: number; expiringSoon: number }> = {};
    for (const p of PLATFORMS) byPlatform[p.id] = { total: 0, connected: 0, degraded: 0, disconnected: 0, expiringSoon: 0 };
    const soon = Date.now() + 7 * DAY;
    for (const r of rows) {
      const b = byPlatform[r.platform] ?? (byPlatform[r.platform] = { total: 0, connected: 0, degraded: 0, disconnected: 0, expiringSoon: 0 });
      b.total++;
      if (r.connection_status === "connected") b.connected++;
      else if (r.connection_status === "needs_reauth" || r.connection_status === "syncing") b.degraded++;
      else b.disconnected++;
      if (r.token_expiration && new Date(r.token_expiration).getTime() < soon) b.expiringSoon++;
    }

    const { data: syncs } = await supabaseAdmin
      .from("sync_history")
      .select("success")
      .gte("created_at", isoDaysAgo(7));
    const syncRows = (syncs ?? []) as unknown as Array<{ success: boolean | null }>;
    const ok = syncRows.filter((s) => s.success === true).length;
    const fail = syncRows.filter((s) => s.success === false).length;

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
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [{ data: syncErrors }, { data: pluginEvents }, { data: integrationLogs }, { count: aiAudits }] = await Promise.all([
      supabaseAdmin
        .from("sync_history")
        .select("id, kind, success, error_message, created_at")
        .eq("success", false)
        .order("created_at", { ascending: false })
        .limit(15),
      supabaseAdmin
        .from("plugin_events")
        .select("id, plugin_slug, event_type, success, message, created_at")
        .order("created_at", { ascending: false })
        .limit(15),
      supabaseAdmin
        .from("platform_integration_logs")
        .select("id, platform, event_type, success, message, created_at")
        .order("created_at", { ascending: false })
        .limit(15),
      supabaseAdmin
        .from("ai_audits")
        .select("id", { count: "exact", head: true })
        .gte("created_at", isoDaysAgo(7)),
    ]);

    return {
      syncErrors: (syncErrors ?? []) as unknown as Array<{ id: string; kind: string; success: boolean | null; error_message: string | null; created_at: string }>,
      pluginEvents: (pluginEvents ?? []) as unknown as Array<{ id: string; plugin_slug: string; event_type: string; success: boolean | null; message: string | null; created_at: string }>,
      integrationLogs: (integrationLogs ?? []) as unknown as Array<{ id: string; platform: string; event_type: string; success: boolean | null; message: string | null; created_at: string }>,
      aiAudits7d: aiAudits ?? 0,
    };
  });


// ---------- Financial + churn stats (Rothme is a single $200/mo plan) ----------

const ROTHME_MONTHLY_PRICE_USD = 200;

export const getFinancialStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { environment?: "sandbox" | "live" }) => d ?? {})
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const env = data.environment ?? "live";

    const [{ count: activeCount }, { count: trialingCount }, { count: pastDueCount }, { count: canceled30d }, { count: activeAtStart }] = await Promise.all([
      supabaseAdmin.from("subscriptions").select("id", { count: "exact", head: true }).eq("environment", env).eq("status", "active"),
      supabaseAdmin.from("subscriptions").select("id", { count: "exact", head: true }).eq("environment", env).eq("status", "trialing"),
      supabaseAdmin.from("subscriptions").select("id", { count: "exact", head: true }).eq("environment", env).eq("status", "past_due"),
      supabaseAdmin
        .from("subscriptions")
        .select("id", { count: "exact", head: true })
        .eq("environment", env)
        .eq("status", "canceled")
        .gte("updated_at", isoDaysAgo(30)),
      // Approx active-at-start = current active + churned in window
      supabaseAdmin
        .from("subscriptions")
        .select("id", { count: "exact", head: true })
        .eq("environment", env)
        .in("status", ["active", "canceled"])
        .lte("created_at", isoDaysAgo(30)),
    ]);

    const active = activeCount ?? 0;
    const trialing = trialingCount ?? 0;
    const pastDue = pastDueCount ?? 0;
    const churned = canceled30d ?? 0;
    const base = activeAtStart ?? active + churned;
    const churnRate = base > 0 ? churned / base : 0;

    const mrr = active * ROTHME_MONTHLY_PRICE_USD;
    const arr = mrr * 12;

    return {
      environment: env,
      activeSubscribers: active,
      trialing,
      pastDue,
      churned30d: churned,
      churnRate,
      mrrUsd: mrr,
      arrUsd: arr,
      priceUsd: ROTHME_MONTHLY_PRICE_USD,
    };
  });

export const getRecentCancellations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { environment?: "sandbox" | "live" }) => d ?? {})
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const env = data.environment ?? "live";
    const { data: rows } = await supabaseAdmin
      .from("subscriptions")
      .select("id, customer_email, status, cancel_at_period_end, current_period_end, updated_at")
      .eq("environment", env)
      .or("status.eq.canceled,cancel_at_period_end.eq.true")
      .order("updated_at", { ascending: false })
      .limit(10);
    return (rows ?? []) as unknown as Array<{
      id: string;
      customer_email: string | null;
      status: string | null;
      cancel_at_period_end: boolean | null;
      current_period_end: string | null;
      updated_at: string | null;
    }>;
  });
