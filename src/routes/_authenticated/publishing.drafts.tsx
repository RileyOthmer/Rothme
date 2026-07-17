import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  Archive,
  ArchiveRestore,
  Copy,
  Inbox,
  MoreHorizontal,
  PenSquare,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import {
  listPosts,
  deletePost,
  duplicatePost,
  setPostStatus,
} from "@/lib/publishing/publishing.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/_authenticated/publishing/drafts")({
  head: () => ({
    meta: [
      { title: "Draft Library — ROTHME" },
      {
        name: "description",
        content:
          "Every draft in one place — search, sort, filter, edit, duplicate, archive, or delete before anything ships.",
      },
    ],
  }),
  component: DraftLibrary,
});

type Variant = { platform_id: string };
type Post = {
  id: string;
  title: string | null;
  body: string;
  status:
    | "draft"
    | "scheduled"
    | "publishing"
    | "published"
    | "failed"
    | "archived";
  tags: string[] | null;
  created_at: string;
  updated_at: string;
  post_variants?: Variant[] | null;
};

type StatusFilter = "all" | "draft" | "archived";
type SortKey = "updated_desc" | "updated_asc" | "created_desc" | "title_asc";

function DraftLibrary() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const fetchList = useServerFn(listPosts);
  const delFn = useServerFn(deletePost);
  const dupFn = useServerFn(duplicatePost);
  const statusFn = useServerFn(setPostStatus);

  // Ask the server for both draft and archived so filters are instant.
  const query = useQuery({
    queryKey: ["publishing", "drafts", "library"],
    queryFn: () =>
      fetchList({ data: { status: ["draft", "archived"], limit: 500 } }) as Promise<Post[]>,
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("draft");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("updated_desc");

  const [confirmDelete, setConfirmDelete] = useState<Post | null>(null);

  const invalidate = () =>
    qc.invalidateQueries({ queryKey: ["publishing"] });

  const del = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Draft deleted");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message || "Delete failed"),
  });
  const dup = useMutation({
    mutationFn: (id: string) => dupFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Duplicated as new draft");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message || "Duplicate failed"),
  });
  const setStatus = useMutation({
    mutationFn: (v: { id: string; status: Post["status"] }) =>
      statusFn({ data: v }),
    onSuccess: (_r, v) => {
      toast.success(v.status === "archived" ? "Archived" : "Restored to drafts");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message || "Update failed"),
  });

  const allPlatforms = useMemo(() => {
    const set = new Set<string>();
    for (const p of query.data ?? []) {
      for (const v of p.post_variants ?? []) if (v?.platform_id) set.add(v.platform_id);
    }
    return Array.from(set).sort();
  }, [query.data]);

  const rows = useMemo(() => {
    let list = query.data ?? [];
    if (statusFilter !== "all") list = list.filter((p) => p.status === statusFilter);
    if (platformFilter !== "all") {
      list = list.filter((p) =>
        (p.post_variants ?? []).some((v) => v.platform_id === platformFilter),
      );
    }
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((p) =>
        [(p.title ?? ""), p.body, ...(p.tags ?? [])]
          .join(" ")
          .toLowerCase()
          .includes(q),
      );
    }
    const sorted = [...list];
    sorted.sort((a, b) => {
      switch (sortKey) {
        case "updated_asc":
          return a.updated_at.localeCompare(b.updated_at);
        case "created_desc":
          return b.created_at.localeCompare(a.created_at);
        case "title_asc":
          return (a.title ?? "").localeCompare(b.title ?? "");
        case "updated_desc":
        default:
          return b.updated_at.localeCompare(a.updated_at);
      }
    });
    return sorted;
  }, [query.data, search, statusFilter, platformFilter, sortKey]);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, body, or tag…"
            className="pl-8"
            aria-label="Search drafts"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
            <SelectTrigger className="h-9 w-[130px]" aria-label="Filter by status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Drafts</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
          <Select value={platformFilter} onValueChange={setPlatformFilter}>
            <SelectTrigger className="h-9 w-[150px]" aria-label="Filter by platform">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All platforms</SelectItem>
              {allPlatforms.map((p) => (
                <SelectItem key={p} value={p}>
                  {prettyPlatform(p)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
            <SelectTrigger className="h-9 w-[170px]" aria-label="Sort drafts">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updated_desc">Last updated · newest</SelectItem>
              <SelectItem value="updated_asc">Last updated · oldest</SelectItem>
              <SelectItem value="created_desc">Created · newest</SelectItem>
              <SelectItem value="title_asc">Title · A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* States */}
      {query.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading drafts…</p>
      ) : rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-10 text-center">
          <Inbox className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm font-medium">
            {search || platformFilter !== "all" || statusFilter !== "draft"
              ? "No drafts match your filters"
              : "No drafts yet"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Compose a new post or ask Rothme AI to draft one for you.
          </p>
          <Button className="mt-4" onClick={() => navigate({ to: "/publishing/compose" })}>
            <PenSquare className="mr-2 h-4 w-4" /> Compose
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          {/* Header (desktop) */}
          <div className="hidden grid-cols-[minmax(0,2fr)_1.2fr_1fr_1fr_0.8fr_auto] gap-4 border-b border-border bg-surface px-4 py-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground sm:grid">
            <div>Draft title</div>
            <div>Platform</div>
            <div>Created</div>
            <div>Last updated</div>
            <div>Status</div>
            <div className="w-10" aria-hidden />
          </div>
          <ul className="divide-y divide-border">
            {rows.map((p) => (
              <li
                key={p.id}
                className="grid grid-cols-1 gap-2 px-4 py-3 sm:grid-cols-[minmax(0,2fr)_1.2fr_1fr_1fr_0.8fr_auto] sm:items-center sm:gap-4"
              >
                <button
                  type="button"
                  className="min-w-0 text-left"
                  onClick={() =>
                    navigate({
                      to: "/publishing/compose",
                      search: { id: p.id } as never,
                    })
                  }
                >
                  <p className="truncate text-sm font-medium text-foreground">
                    {p.title || "Untitled"}
                  </p>
                  <p className="line-clamp-1 text-xs text-muted-foreground">
                    {p.body || "No content yet."}
                  </p>
                </button>
                <div className="text-xs text-muted-foreground">
                  {platformSummary(p.post_variants ?? [])}
                </div>
                <div className="text-xs text-muted-foreground">{formatDate(p.created_at)}</div>
                <div className="text-xs text-muted-foreground">{formatDate(p.updated_at)}</div>
                <div>
                  <StatusBadge status={p.status} />
                </div>
                <div className="flex justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label="Actions">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() =>
                          navigate({
                            to: "/publishing/compose",
                            search: { id: p.id } as never,
                          })
                        }
                      >
                        <PenSquare className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => dup.mutate(p.id)}
                        disabled={dup.isPending}
                      >
                        <Copy className="mr-2 h-4 w-4" /> Duplicate
                      </DropdownMenuItem>
                      {p.status === "archived" ? (
                        <DropdownMenuItem
                          onClick={() => setStatus.mutate({ id: p.id, status: "draft" })}
                          disabled={setStatus.isPending}
                        >
                          <ArchiveRestore className="mr-2 h-4 w-4" /> Restore
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() => setStatus.mutate({ id: p.id, status: "archived" })}
                          disabled={setStatus.isPending}
                        >
                          <Archive className="mr-2 h-4 w-4" /> Archive
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setConfirmDelete(p)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete…
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Delete confirmation — required, never delete silently */}
      <AlertDialog
        open={!!confirmDelete}
        onOpenChange={(open) => !open && setConfirmDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this draft?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{confirmDelete?.title || "Untitled"}&rdquo; will be permanently removed.
              This cannot be undone. If you might want it back later, archive it instead.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmDelete) del.mutate(confirmDelete.id);
                setConfirmDelete(null);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete draft
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function StatusBadge({ status }: { status: Post["status"] }) {
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  const variant: "secondary" | "outline" | "default" =
    status === "archived" ? "outline" : status === "draft" ? "secondary" : "default";
  return <Badge variant={variant}>{label}</Badge>;
}

function platformSummary(variants: Variant[]): string {
  const names = Array.from(new Set(variants.map((v) => prettyPlatform(v.platform_id))));
  if (names.length === 0) return "—";
  if (names.length <= 2) return names.join(", ");
  return `${names.slice(0, 2).join(", ")} +${names.length - 2}`;
}

function prettyPlatform(slug: string): string {
  return slug
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const sameYear = d.getFullYear() === now.getFullYear();
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: sameYear ? undefined : "numeric",
  });
}
