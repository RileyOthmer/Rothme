import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createTask } from "@/lib/collab/tasks.functions";
import { listMembers } from "@/lib/collab/members.functions";
import { useActiveOrg } from "./useActiveOrg";

export function AssignTaskDialog({
  children,
  defaultTitle,
  subjectType,
  subjectId,
}: {
  children: React.ReactNode;
  defaultTitle?: string;
  subjectType?: "decision" | "report" | "goal" | "dashboard";
  subjectId?: string;
}) {
  const activeOrg = useActiveOrg();
  const orgId = activeOrg.data?.id;
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(defaultTitle ?? "");
  const [desc, setDesc] = useState("");
  const [assignee, setAssignee] = useState<string>("me");
  const [due, setDue] = useState("");

  const members = useQuery({
    queryKey: ["collab", "members", orgId],
    queryFn: () => listMembers({ data: { orgId: orgId! } }),
    enabled: !!orgId && open,
  });

  const mut = useMutation({
    mutationFn: () =>
      createTask({
        data: {
          orgId: orgId!,
          title: title.trim(),
          description: desc || undefined,
          assigneeId: assignee === "me" ? undefined : assignee,
          subjectType,
          subjectId,
          dueDate: due || undefined,
        },
      }),
    onSuccess: () => {
      toast.success("Task assigned");
      setOpen(false);
      setTitle(defaultTitle ?? "");
      setDesc("");
      setDue("");
      qc.invalidateQueries({ queryKey: ["collab"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign a task</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input
            placeholder="What needs to be done?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
          <Textarea
            placeholder="Notes (optional)"
            rows={3}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Assign to</label>
              <Select value={assignee} onValueChange={setAssignee}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="me">Me</SelectItem>
                  {(members.data ?? []).map((m) => (
                    <SelectItem key={m.user_id} value={m.user_id}>
                      {m.full_name ?? "Member"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Due</label>
              <Input type="date" value={due} onChange={(e) => setDue(e.target.value)} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button disabled={!title.trim() || mut.isPending || !orgId} onClick={() => mut.mutate()}>
            Assign task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
