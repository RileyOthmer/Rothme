import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Activity, Link2, FileEdit, Sparkles, Send, RefreshCw, User2, ClipboardCheck,
  MessageSquare, UserPlus,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { listActivity } from "@/lib/collab/activity.functions";
import { getActiveOrg } from "@/lib/collab/orgs.functions";

function iconFor(verb: string) {
  if (verb.startsWith("connection.")) return Link2;
  if (verb.startsWith("post.published") || verb === "content.published") return Send;
  if (verb.startsWith("post.") || verb.startsWith("draft.")) return FileEdit;
  if (verb.startsWith("ai.")) return Sparkles;
  if (verb.startsWith("analytics.")) return RefreshCw;
  if (verb.startsWith("task.")) return ClipboardCheck;
  if (verb.startsWith("comment.")) return MessageSquare;
  if (verb.startsWith("member.") || verb.startsWith("invite.")) return UserPlus;
  return Activity;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function RecentActivity({ limit = 8 }: { limit?: number }) {
  const activeOrgFn = useServerFn(getActiveOrg);
  const listFn = useServerFn(listActivity);

  const orgQ = useQuery({ queryKey: ["active-org"], queryFn: () => activeOrgFn() });
  const orgId = orgQ.data?.id;

  const q = useQuery({
    queryKey: ["recent-activity", orgId, limit],
    enabled: Boolean(orgId),
    queryFn: () => listFn({ data: { orgId: orgId as string, limit } }),
  });

  const loading = orgQ.isLoading || (Boolean(orgId) && q.isLoading);
  const events = q.data ?? [];

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Recent activity</h2>
        <Activity className="h-4 w-4 text-muted-foreground" />
      </div>

      {loading ? (
        <ul className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <li key={i} className="h-10 animate-pulse rounded-lg bg-muted/40" />
          ))}
        </ul>
      ) : events.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-surface-2/40 p-6 text-center text-sm text-muted-foreground">
          No activity yet.
        </div>
      ) : (
        <ul className="space-y-3">
          {events.map((e) => {
            const Icon = iconFor(e.verb);
            return (
              <li key={e.id} className="flex items-start gap-3">
                <div className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border border-border bg-surface text-muted-foreground">
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm text-foreground">{e.summary}</div>
                  <div className="text-xs text-muted-foreground">
                    {e.actor_name ?? "Someone"} · {timeAgo(e.created_at)}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
