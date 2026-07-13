import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal, UserMinus, Shield, Crown } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { listMembers, removeMember, updateMemberRole } from "@/lib/collab/members.functions";
import { canAdmin, ROLE_LABEL, type OrgRole } from "./types";

export function MembersTable({ orgId, myRole }: { orgId: string; myRole: OrgRole }) {
  const qc = useQueryClient();
  const members = useQuery({
    queryKey: ["collab", "members", orgId],
    queryFn: () => listMembers({ data: { orgId } }),
  });

  const roleMut = useMutation({
    mutationFn: (v: { userId: string; role: OrgRole }) =>
      updateMemberRole({ data: { orgId, ...v } }),
    onSuccess: () => {
      toast.success("Role updated");
      qc.invalidateQueries({ queryKey: ["collab", "members", orgId] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  const removeMut = useMutation({
    mutationFn: (userId: string) => removeMember({ data: { orgId, userId } }),
    onSuccess: () => {
      toast.success("Removed");
      qc.invalidateQueries({ queryKey: ["collab", "members", orgId] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  const admin = canAdmin(myRole);

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead className="bg-surface/50 text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-2.5 text-left">Name</th>
            <th className="px-4 py-2.5 text-left">Role</th>
            <th className="px-4 py-2.5 text-left">Joined</th>
            <th className="w-10 px-4 py-2.5" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {(members.data ?? []).map((m) => (
            <tr key={m.user_id}>
              <td className="px-4 py-3 font-medium text-foreground">{m.full_name ?? "Member"}</td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2 py-0.5 text-xs">
                  {m.role === "owner" ? <Crown className="h-3 w-3" /> : m.role === "admin" ? <Shield className="h-3 w-3" /> : null}
                  {ROLE_LABEL[m.role]}
                </span>
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {new Date(m.joined_at).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-right">
                {admin && m.role !== "owner" ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger className="rounded p-1 hover:bg-surface">
                      <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {m.role !== "admin" ? (
                        <DropdownMenuItem
                          onClick={() => roleMut.mutate({ userId: m.user_id, role: "admin" })}
                        >
                          Make admin
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() => roleMut.mutate({ userId: m.user_id, role: "member" })}
                        >
                          Make member
                        </DropdownMenuItem>
                      )}
                      {myRole === "owner" ? (
                        <DropdownMenuItem
                          onClick={() => roleMut.mutate({ userId: m.user_id, role: "owner" })}
                        >
                          Transfer ownership
                        </DropdownMenuItem>
                      ) : null}
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => removeMut.mutate(m.user_id)}
                      >
                        <UserMinus className="mr-2 h-4 w-4" />
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : null}
              </td>
            </tr>
          ))}
          {members.data?.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                No members yet.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
