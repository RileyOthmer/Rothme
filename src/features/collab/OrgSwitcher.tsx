import { Check, ChevronsUpDown, Plus, Users } from "lucide-react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useActiveOrg, useMyOrgs } from "./useActiveOrg";
import { createOrg, setActiveOrg } from "@/lib/collab/orgs.functions";

export function OrgSwitcher() {
  const qc = useQueryClient();
  const active = useActiveOrg();
  const orgs = useMyOrgs();
  const [newOpen, setNewOpen] = useState(false);
  const [name, setName] = useState("");

  const switchTo = useMutation({
    mutationFn: (orgId: string) => setActiveOrg({ data: { orgId } }),
    onSuccess: () => qc.invalidateQueries(),
  });

  const create = useMutation({
    mutationFn: (n: string) => createOrg({ data: { name: n } }),
    onSuccess: () => {
      toast.success("Workspace created");
      setNewOpen(false);
      setName("");
      qc.invalidateQueries();
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed to create workspace"),
  });

  const label = active.data?.name ?? "Workspace";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="inline-flex h-8 max-w-[180px] items-center gap-1.5 truncate rounded-md border border-border bg-surface px-2.5 text-xs font-medium text-foreground shadow-xs transition-colors hover:bg-surface-2">
          <Users className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{label}</span>
          <ChevronsUpDown className="h-3 w-3 shrink-0 opacity-60" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>Your workspaces</DropdownMenuLabel>
          {(orgs.data ?? []).map((o) => (
            <DropdownMenuItem
              key={o.id}
              onClick={() => switchTo.mutate(o.id)}
              className="cursor-pointer"
            >
              <div className="flex w-full items-center gap-2">
                <span className="flex-1 truncate">{o.name}</span>
                {o.is_personal ? (
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    Personal
                  </span>
                ) : null}
                {active.data?.id === o.id ? <Check className="h-3.5 w-3.5 text-primary" /> : null}
              </div>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setNewOpen(true)} className="cursor-pointer">
            <Plus className="mr-2 h-4 w-4" /> New workspace
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New team workspace</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Create a shared workspace to invite your team, comment on decisions, and assign tasks.
          </p>
          <Input
            autoFocus
            placeholder="e.g. Acme Marketing"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && name.trim()) create.mutate(name.trim());
            }}
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setNewOpen(false)}>
              Cancel
            </Button>
            <Button disabled={!name.trim() || create.isPending} onClick={() => create.mutate(name.trim())}>
              Create workspace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
