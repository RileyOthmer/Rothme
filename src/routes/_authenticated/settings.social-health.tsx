import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Activity, RefreshCw, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useActiveOrg } from "@/features/collab/useActiveOrg";
import { listSocialConnections, listSocialEvents, pingSocialConnection } from "@/lib/social/social.functions";

export const Route = createFileRoute("/_authenticated/settings/social-health")({
  head: () => ({
    meta: [
      { title: "Connection Health — ROTHME" },
      { name: "description", content: "Monitor social platform connection health, sync status, and recent activity." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SocialHealthPage,
});

function SocialHealthPage() {
  const orgQ = useActiveOrg();
  const orgId = orgQ.data?.id;
  const qc = useQueryClient();

  const listConn = useServerFn(listSocialConnections);
  const listEv = useServerFn(listSocialEvents);
  const pingFn = useServerFn(pingSocialConnection);

  const conns = useQuery({
    queryKey: ["social", "connections", orgId],
    queryFn: () => listConn({ data: { orgId: orgId! } }),
    enabled: !!orgId,
  });

  const events = useQuery({
    queryKey: ["social", "events", orgId],
    queryFn: () => listEv({ data: { orgId: orgId!, limit: 25 } }),
    enabled: !!orgId,
  });

  const ping = useMutation({
    mutationFn: (connectionId: string) => pingFn({ data: { connectionId } }),
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ["social"] });
      r.ok ? toast.success(`Sync ok — ${r.snapshots} snapshot(s)`) : toast.error(r.error ?? "Sync failed");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <header className="mb-8">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Integrations</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Connection health</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Live status for every connected platform. If something breaks, you'll see it here first.
          </p>
        </header>

        <section className="mb-10">
          <h2 className="mb-3 text-sm font-semibold">Connections</h2>
          {!orgId || conns.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : (conns.data ?? []).length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
              No social platforms connected yet.
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-border/60">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left">Platform</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Health</th>
                    <th className="px-4 py-3 text-left">Last sync</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {(conns.data ?? []).map((c: any) => (
                    <tr key={c.id} className="border-t border-border/60">
                      <td className="px-4 py-3 font-medium capitalize">{c.platform}{c.external_handle ? ` · ${c.external_handle}` : ""}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="px-4 py-3">
                        <HealthBar score={c.health_score ?? 0} />
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {c.last_synced_at ? new Date(c.last_synced_at).toLocaleString() : "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button size="sm" variant="ghost"
                          disabled={ping.isPending}
                          onClick={() => ping.mutate(c.id)}>
                          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                          Sync now
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold flex items-center gap-2">
            <Activity className="h-4 w-4" /> Recent activity
          </h2>
          <div className="rounded-2xl border border-border/60 divide-y divide-border/60">
            {(events.data ?? []).length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">No events yet.</div>
            ) : (
              (events.data ?? []).map((e: any) => (
                <div key={e.id} className="flex items-start gap-3 px-4 py-3 text-sm">
                  <LevelDot level={e.level} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{e.event}</span>
                      {e.platform && <Badge variant="outline" className="text-[10px]">{e.platform}</Badge>}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground truncate">{e.scope}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(e.created_at).toLocaleTimeString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "connected" ? "bg-emerald-500/10 text-emerald-500"
    : status === "degraded" ? "bg-amber-500/10 text-amber-500"
    : status === "error" ? "bg-red-500/10 text-red-500"
    : "bg-muted text-muted-foreground";
  return <span className={"rounded-full px-2 py-0.5 text-xs font-medium " + tone}>{status}</span>;
}

function HealthBar({ score }: { score: number }) {
  const color = score >= 75 ? "bg-emerald-500" : score >= 40 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
        <div className={"h-full " + color} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs tabular-nums text-muted-foreground">{score}</span>
    </div>
  );
}

function LevelDot({ level }: { level: string }) {
  const color = level === "error" ? "text-red-500" : level === "warn" ? "text-amber-500" : "text-muted-foreground";
  return <ShieldAlert className={"mt-0.5 h-4 w-4 " + color} />;
}
