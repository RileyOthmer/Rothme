import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMetricsStatus } from "@/lib/metrics-status.functions";

/**
 * Returns whether the signed-in user has any real synced metrics.
 * Analytics dashboards use this to decide between rendering charts
 * (real data) or the empty state (no data). Never show sample
 * numbers when `hasMetrics` is false.
 */
export function useHasMetrics() {
  const fn = useServerFn(getMetricsStatus);
  const q = useQuery({
    queryKey: ["metrics", "status"],
    queryFn: () => fn(),
    staleTime: 30_000,
  });
  return {
    hasMetrics: q.data?.hasMetrics ?? false,
    total: q.data?.total ?? 0,
    isLoading: q.isLoading,
  };
}
