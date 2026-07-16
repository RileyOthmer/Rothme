import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { checkIsAdmin } from "@/lib/admin/credentials.functions";

export function useIsAdmin() {
  const fn = useServerFn(checkIsAdmin);
  const q = useQuery({
    queryKey: ["admin", "is-admin"],
    queryFn: () => fn({}),
    staleTime: 60_000,
  });
  return { isAdmin: q.data?.isAdmin ?? false, isLoading: q.isLoading };
}
