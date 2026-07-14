import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { DevCenterShell, EmptyPanel } from "@/features/dev-center/DevCenterShell";
import { useActiveOrg } from "@/features/collab/useActiveOrg";
import { listSocialConnections } from "@/lib/social/social.functions";
import { findPlatform } from "@/lib/dev-center/social-platforms";

export const Route = createFileRoute("/_authenticated/dev-center/health")({
  component: HealthPage,
});

function HealthPage() {
  const org = useActiveOrg();
  const listFn = useServerFn(listSocialConnections);
  const q = useQuery({
    queryKey: ["dev-center", "connections", org.data?.id],
    queryFn: () => listFn({ data: { orgId: org.data!.id } }),
    enabled: !!org.data?.id,
  });
  const rows = (q.data ?? []) as Array<{
    id: string; platform: string; status: string | null;
    health_score: number | null; last_synced_at: string | null;
    last_error_kind: string | null; last_error_message: string | null;
  }>;
  const overall = rows.length ? Math.round(rows.reduce((a, r) => a + (r.health_score ?? 0), 0) / rows.length) : null;

  return (
    <DevCenterShell
      title="API Health"
      description="Connection status, token freshness, sync outcomes, and rate-limit signals for every provider."
    >
      <div className="mb-6 rounded-2xl border border-border/60 bg-card/40 p-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Overall Health Score</p>
        <p className="mt-1 text-3xl font-semibold">{overall == null ? "—" : `${overall}/100`}</p>
        <p className="mt-1 text-xs text-muted-foreground">Averaged across {rows.length} connection{rows.length === 1 ? "" : "s"}.</p>
      </div>

      {rows.length === 0 ? (
        <EmptyPanel title="Nothing to monitor yet" body="Once you connect a platform, health, latency, and rate-limit usage will appear here." />
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => {
            const p = findPlatform(r.platform);
            const score = r.health_score ?? 0;
            const bar = score >= 75 ? "bg-emerald-500" : score >= 40 ? "bg-amber-500" : "bg-red-500";
            return (
              <li key={r.id} className="rounded-2xl border border-border/60 bg-card/40 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{p?.name ?? r.platform}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.status ?? "unknown"} · last sync {r.last_synced_at ? new Date(r.last_synced_at).toLocaleString() : "never"}
                    </p>
                    {r.last_error_message ? (
                      <p className="mt-1 text-xs text-red-500">{r.last_error_kind}: {r.last_error_message}</p>
                    ) : null}
                  </div>
                  <span className="tabular-nums text-sm font-semibold">{score}/100</span>
                </div>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className={`h-full ${bar}`} style={{ width: `${score}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </DevCenterShell>
  );
}
