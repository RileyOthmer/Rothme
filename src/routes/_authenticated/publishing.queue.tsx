import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { listPosts } from "@/lib/publishing/publishing.functions";
import { Clock, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/publishing/queue")({
  component: QueuePage,
});

function QueuePage() {
  const fn = useServerFn(listPosts);
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ["publishing", "queue"],
    queryFn: () => fn({ data: { status: ["scheduled", "publishing", "failed"], limit: 200 } }),
  });

  const items = (data ?? [])
    .flatMap((p: any) =>
      (p.post_schedules ?? [])
        .filter((s: any) => s.status === "pending" || s.status === "publishing" || s.status === "failed")
        .map((s: any) => ({ post: p, schedule: s })),
    )
    .sort((a, b) => +new Date(a.schedule.scheduled_at) - +new Date(b.schedule.scheduled_at));

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium">Upcoming</h2>
          <p className="text-xs text-muted-foreground">Scheduled posts across every connected platform.</p>
        </div>
        <Button onClick={() => navigate({ to: "/publishing/compose" })}>
          <PlusCircle className="mr-2 h-4 w-4" /> New post
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading queue…</p>
      ) : items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-10 text-center">
          <Clock className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm font-medium">No scheduled posts</p>
          <p className="mt-1 text-xs text-muted-foreground">Head to Compose to draft your first post.</p>
          <Button className="mt-4" onClick={() => navigate({ to: "/publishing/compose" })}>
            Compose a post
          </Button>
        </div>
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border">
          {items.map(({ post, schedule }) => (
            <li key={schedule.id} className="flex items-start justify-between gap-4 p-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] uppercase">
                    {schedule.platform_id}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(schedule.scheduled_at).toLocaleString()}
                  </span>
                  {schedule.status === "failed" ? (
                    <Badge variant="destructive" className="text-[10px]">Failed</Badge>
                  ) : null}
                </div>
                <p className="mt-1 truncate text-sm">{post.title || post.body.slice(0, 120) || "Untitled"}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate({ to: "/publishing/compose", search: { id: post.id } as any })}
              >
                Edit
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
