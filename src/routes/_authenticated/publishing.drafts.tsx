import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listPosts, deletePost } from "@/lib/publishing/publishing.functions";
import { Button } from "@/components/ui/button";
import { Inbox, PenSquare, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/publishing/drafts")({
  component: DraftsPage,
});

function DraftsPage() {
  const fn = useServerFn(listPosts);
  const del = useServerFn(deletePost);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["publishing", "drafts"],
    queryFn: () => fn({ data: { status: ["draft"], limit: 200 } }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => {
      toast.success("Draft deleted");
      qc.invalidateQueries({ queryKey: ["publishing"] });
    },
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading drafts…</p>;
  if ((data ?? []).length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-10 text-center">
        <Inbox className="mx-auto h-8 w-8 text-muted-foreground" />
        <p className="mt-3 text-sm font-medium">No drafts yet</p>
        <Button className="mt-4" onClick={() => navigate({ to: "/publishing/compose" })}>
          <PenSquare className="mr-2 h-4 w-4" /> Compose
        </Button>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border rounded-lg border border-border">
      {(data ?? []).map((p: any) => (
        <li key={p.id} className="flex items-start justify-between gap-4 p-4">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{p.title || "Untitled"}</p>
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{p.body}</p>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Updated {new Date(p.updated_at).toLocaleString()}
            </p>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate({ to: "/publishing/compose", search: { id: p.id } as any })}
            >
              <PenSquare className="mr-1 h-3.5 w-3.5" /> Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => remove.mutate(p.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
