import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getConnectionStatus } from "@/lib/connections-status.functions";

/**
 * Returns whether the signed-in user has any data source connected.
 *
 * While false, dashboards and analytics surfaces should render zeros
 * and empty states — never seeded / mock numbers — so users don't
 * mistake placeholder data for real reporting.
 */
export function useHasConnections() {
  const fn = useServerFn(getConnectionStatus);
  const q = useQuery({
    queryKey: ["connections", "status"],
    queryFn: () => fn(),
    staleTime: 30_000,
  });
  return {
    hasConnections: q.data?.hasConnections ?? false,
    total: q.data?.total ?? 0,
    isLoading: q.isLoading,
  };
}
