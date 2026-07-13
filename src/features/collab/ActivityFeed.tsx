import { useQuery } from "@tanstack/react-query";
import {
  MessageSquare,
  UserPlus,
  CheckCircle2,
  XCircle,
  ClipboardList,
  Activity,
} from "lucide-react";
import { listActivity } from "@/lib/collab/activity.functions";

const VERB_ICON: Record<string, any> = {
  commented: MessageSquare,
  invited: UserPlus,
  joined: UserPlus,
  assigned: ClipboardList,
  completed_task: CheckCircle2,
  requested_approval: ClipboardList,
  approved: CheckCircle2,
  rejected: XCircle,
};

function timeAgo(iso: string): string {
  const d = new Date(iso);
  const min = Math.floor((Date.now() - d.getTime()) / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  return d.toLocaleDateString();
}

export function ActivityFeed({ orgId }: { orgId: string }) {
  const q = useQuery({
    queryKey: ["collab", "activity", orgId],
    queryFn: () => listActivity({ data: { orgId, limit: 100 } }),
  });

  if (q.isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  const items = q.data ?? [];
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Nothing yet. As your team comments, assigns tasks, or approves decisions, it will show up here.
      </div>
    );
  }

  return (
    <ol className="space-y-2">
      {items.map((e) => {
        const Icon = VERB_ICON[e.verb] ?? Activity;
        return (
          <li
            key={e.id}
            className="flex items-start gap-3 rounded-lg border border-border bg-card px-3 py-2.5"
          >
            <div className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-surface">
              <Icon className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-foreground">
                <span className="font-medium">{e.actor_name ?? "Someone"}</span>{" "}
                <span className="text-muted-foreground">{e.summary.replace(/^[A-Z]/, (c) => c.toLowerCase())}</span>
              </p>
              <p className="text-xs text-muted-foreground">{timeAgo(e.created_at)}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
