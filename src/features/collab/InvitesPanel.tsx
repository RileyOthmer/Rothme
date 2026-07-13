import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, Mail, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { inviteMember, listInvites, revokeInvite } from "@/lib/collab/members.functions";
import { canAdmin, type OrgRole } from "./types";

export function InvitesPanel({ orgId, myRole }: { orgId: string; myRole: OrgRole }) {
  const qc = useQueryClient();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "member">("member");

  const invites = useQuery({
    queryKey: ["collab", "invites", orgId],
    queryFn: () => listInvites({ data: { orgId } }),
  });

  const invite = useMutation({
    mutationFn: () => inviteMember({ data: { orgId, email: email.trim(), role } }),
    onSuccess: (inv) => {
      const link = `${window.location.origin}/invite/${inv.token}`;
      navigator.clipboard.writeText(link).catch(() => {});
      toast.success("Invite created — link copied to clipboard");
      setEmail("");
      qc.invalidateQueries({ queryKey: ["collab", "invites", orgId] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed to invite"),
  });

  const revoke = useMutation({
    mutationFn: (id: string) => revokeInvite({ data: { orgId, inviteId: id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["collab", "invites", orgId] }),
  });

  if (!canAdmin(myRole)) {
    return <p className="text-sm text-muted-foreground">Only admins can invite teammates.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-2">
        <div className="flex-1 min-w-[220px]">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Email</label>
          <Input
            type="email"
            placeholder="teammate@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Role</label>
          <Select value={role} onValueChange={(v) => setRole(v as any)}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="member">Member</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={() => invite.mutate()}
          disabled={!email.trim() || invite.isPending}
        >
          <Mail className="mr-1.5 h-3.5 w-3.5" />
          Send invite
        </Button>
      </div>

      <div className="rounded-xl border border-border">
        <div className="border-b border-border bg-surface/50 px-4 py-2 text-xs uppercase tracking-wide text-muted-foreground">
          Pending invites
        </div>
        {(invites.data ?? []).length === 0 ? (
          <p className="px-4 py-6 text-sm text-muted-foreground">No pending invites.</p>
        ) : (
          <ul className="divide-y divide-border">
            {(invites.data ?? []).map((inv) => {
              const link = `${window.location.origin}/invite/${inv.token}`;
              return (
                <li key={inv.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{inv.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {inv.role} · expires {new Date(inv.expires_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(link);
                      toast.success("Link copied");
                    }}
                    className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2 py-1 text-xs hover:bg-surface-2"
                  >
                    <Copy className="h-3 w-3" />
                    Copy link
                  </button>
                  <button
                    onClick={() => revoke.mutate(inv.id)}
                    className="rounded-md p-1.5 text-muted-foreground hover:bg-surface hover:text-destructive"
                    aria-label="Revoke"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
