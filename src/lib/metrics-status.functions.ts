import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Returns whether the signed-in user has any real MetricSnapshot rows.
 * Analytics dashboards use this to gate live charts — if `false`, every
 * KPI/chart must render as zero / empty state, NEVER as sample data.
 * This is stricter than `getConnectionStatus`: a user can be "connected"
 * but still have no synced metrics.
 */
export const getMetricsStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { count } = await supabase
      .from("metric_snapshots")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);
    const total = count ?? 0;
    return { hasMetrics: total > 0, total };
  });
