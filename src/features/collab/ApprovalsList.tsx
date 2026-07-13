import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, X, Clock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { decideApproval, listApprovals } from "@/lib/collab/approvals.functions";
import { canAdmin, type OrgRole } from "./types";

export function ApprovalsList({ orgId, myRole }: { orgId: string; myRole: OrgRole }) {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["collab", "approvals", orgId],
    queryFn: () => listApprovals({ data: { orgId } }),
  });
  const [openNote, setOpenNote] = useState<string | null>(null);
  const [note, setNote] = useState("");

  const decide = useMutation({
    mutationFn: (v: { id: string; decision: "approved" | "rejected"; note?: string }) =>
      decideApproval({ data: v }),
    onSuccess: () => {
      toast.success("Decision recorded");
      setOpenNote(null);
      setNote("");
      qc.invalidateQueries({ queryKey: ["collab", "approvals", orgId] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  const admin = canAdmin(myRole);
  const items = q.data ?? [];

  if (items.length === 0)
    return (
      <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        No approval requests yet.
      </div>
    );

  return (
    <ul className="space-y-3">
      {items.map((a) => (
        <li key={a.id} className="rounded-xl border border-border bg-card p-4">
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill status={a.status} />
            <p className="text-xs text-muted-foreground">
              from {a.requester_name ?? "member"} · {new Date(a.created_at).toLocaleString()}
            </p>
          </div>
          <h3 className="mt-2 text-sm font-semibold text-foreground">{a.title}</h3>
          {a.rationale ? (
            <p className="mt-1 whitespace-pre-wrap text-sm text-foreground/80">{a.rationale}</p>
          ) : null}
          {a.decision_note ? (
            <p className="mt-2 rounded-md bg-surface/60 p-2 text-xs text-muted-foreground">
              Note: {a.decision_note}
            </p>
          ) : null}

          {admin && a.status === "pending" ? (
            <div className="mt-3">
              {openNote === a.id ? (
                <div className="space-y-2">
                  <Textarea
                    rows={2}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Optional note"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => decide.mutate({ id: a.id, decision: "approved", note })}
                    >
                      <Check className="mr-1.5 h-3.5 w-3.5" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => decide.mutate({ id: a.id, decision: "rejected", note })}
                    >
                      <X className="mr-1.5 h-3.5 w-3.5" />
                      Reject
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setOpenNote(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => decide.mutate({ id: a.id, decision: "approved" })}>
                    <Check className="mr-1.5 h-3.5 w-3.5" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setOpenNote(a.id);
                      setNote("");
                    }}
                  >
                    <X className="mr-1.5 h-3.5 w-3.5" />
                    Reject with note
                  </Button>
                </div>
              )}
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string; Icon: any }> = {
    pending: { label: "Pending", cls: "bg-amber-500/10 text-amber-600 border-amber-500/20", Icon: Clock },
    approved: { label: "Approved", cls: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", Icon: Check },
    rejected: { label: "Rejected", cls: "bg-destructive/10 text-destructive border-destructive/20", Icon: X },
    cancelled: { label: "Cancelled", cls: "bg-muted text-muted-foreground border-border", Icon: X },
  };
  const it = map[status] ?? map.pending;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${it.cls}`}>
      <it.Icon className="h-3 w-3" />
      {it.label}
    </span>
  );
}
