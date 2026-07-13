import { useQuery } from "@tanstack/react-query";
import { getActiveOrg, listMyOrgs } from "@/lib/collab/orgs.functions";
import type { Organization } from "./types";

export function useActiveOrg() {
  return useQuery({
    queryKey: ["collab", "activeOrg"],
    queryFn: () => getActiveOrg(),
    staleTime: 30_000,
  });
}

export function useMyOrgs() {
  return useQuery<Organization[]>({
    queryKey: ["collab", "myOrgs"],
    queryFn: () => listMyOrgs(),
    staleTime: 30_000,
  });
}
