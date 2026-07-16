import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getConnectionStats } from "@/lib/admin/stats.functions";

export const Route = createFileRoute("/_authenticated/admin/connections")({
  component: ConnectionsPage,
});

function ConnectionsPage() {
  const fn = useServerFn(getConnectionStats);
  const q = useQuery({ queryKey: ["admin", "connections"], queryFn: () => fn({}) });

  if (q.isLoading) return <div className="text-sm text-muted-foreground">Loading…</div>;
  if (q.error) return <div className="text-sm text-destructive">{(q.error as Error).message}</div>;
  const d = q.data!;
  const totalConn = d.platforms.reduce((n, p) => n + p.total, 0);
  const rate = d.syncs7d.total > 0 ? Math.round((d.syncs7d.success / d.syncs7d.total) * 100) : 100;

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Connected accounts" value={totalConn} />
        <Stat label="Sync success (7d)" value={`${rate}%`} sub={`${d.syncs7d.success}/${d.syncs7d.total}`} />
        <Stat label="Expiring in 7 days" value={d.platforms.reduce((n, p) => n + p.expiringSoon, 0)} />
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold">By platform</h2>
        <div className="grid gap-2">
          {d.platforms.map((p) => (
            <div key={p.id} className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3">
              <div className="grid h-8 w-8 place-items-center rounded-lg text-[10px] font-semibold text-white" style={{ backgroundColor: p.brandColor }}>{p.mark}</div>
              <div className="flex-1">
                <div className="text-sm font-medium">{p.name}</div>
                <div className="text-xs text-muted-foreground">
                  {p.total} account{p.total === 1 ? "" : "s"}
                  {p.expiringSoon ? ` · ${p.expiringSoon} token${p.expiringSoon === 1 ? "" : "s"} expiring soon` : ""}
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Chip color="emerald" n={p.connected} label="OK" />
                <Chip color="amber" n={p.degraded} label="Reauth" />
                <Chip color="muted" n={p.disconnected} label="Off" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">{value}</div>
      {sub ? <div className="mt-1 text-xs text-muted-foreground">{sub}</div> : null}
    </div>
  );
}

function Chip({ color, n, label }: { color: "emerald" | "amber" | "muted"; n: number; label: string }) {
  const cls =
    color === "emerald" ? "bg-emerald-500/10 text-emerald-500" :
    color === "amber" ? "bg-amber-500/10 text-amber-500" :
    "bg-muted text-muted-foreground";
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium tabular-nums ${cls}`}>{n} {label}</span>;
}
