import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { requestApproval } from "@/lib/collab/approvals.functions";
import { useActiveOrg } from "./useActiveOrg";

export function RequestApprovalDialog({
  children,
  defaultTitle,
  defaultRationale,
  subjectType,
  subjectId,
}: {
  children: React.ReactNode;
  defaultTitle?: string;
  defaultRationale?: string;
  subjectType?: "decision" | "report" | "goal" | "dashboard";
  subjectId?: string;
}) {
  const activeOrg = useActiveOrg();
  const orgId = activeOrg.data?.id;
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(defaultTitle ?? "");
  const [rationale, setRationale] = useState(defaultRationale ?? "");

  const mut = useMutation({
    mutationFn: () =>
      requestApproval({
        data: {
          orgId: orgId!,
          title: title.trim(),
          rationale: rationale || undefined,
          subjectType,
          subjectId,
        },
      }),
    onSuccess: () => {
      toast.success("Approval requested");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["collab"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request approval</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input
            placeholder="What are you asking approval for?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
          <Textarea
            placeholder="Why does this matter? (optional)"
            rows={4}
            value={rationale}
            onChange={(e) => setRationale(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button disabled={!title.trim() || mut.isPending || !orgId} onClick={() => mut.mutate()}>
            Send to admins
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
