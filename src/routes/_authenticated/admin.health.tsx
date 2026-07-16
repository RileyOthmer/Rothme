import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getHealthStats } from "@/lib/admin/stats.functions";
import { AlertCircle, Boxes, Puzzle, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/health")({
  component: HealthPage,
});

function HealthPage() {
  const fn = useServerFn(getHealthStats);
  const q = useQuery({ queryKey: ["admin", "health"], queryFn: () => fn({}) });

  if (q.isLoading) return <div className="text-sm text-muted-foreground">Loading…</div>;
  if (q.error) return <div className="text-sm text-destructive">{(q.error as Error).message}</div>;
  const d = q.data!;
  const platformFails = d.integrationLogs.filter((l) => l.success === false).length;

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-4">
        <Stat label="Sync errors" value={d.syncErrors.length} icon={<AlertCircle className="h-4 w-4" />} />
        <Stat label="Platform failures" value={platformFails} icon={<Boxes className="h-4 w-4" />} />
        <Stat label="Plugin events" value={d.pluginEvents.length} icon={<Puzzle className="h-4 w-4" />} />
        <Stat label="AI audits (7d)" value={d.aiAudits7d} icon={<Sparkles className="h-4 w-4" />} />
      </div>

      <LogSection title="Sync errors" rows={d.syncErrors.map((r) => ({
        id: r.id,
        primary: r.kind,
        secondary: r.error_message ?? "unknown error",
        ts: r.created_at,
      }))} />

      <LogSection title="Platform integration logs" rows={d.integrationLogs.map((r) => ({
        id: r.id,
        primary: `${r.platform} · ${r.event_type}`,
        secondary: r.message ?? (r.success === false ? "failed" : "ok"),
        ts: r.created_at,
        bad: r.success === false,
      }))} />

      <LogSection title="Plugin events" rows={d.pluginEvents.map((r) => ({
        id: r.id,
        primary: `${r.plugin_slug} · ${r.event_type}`,
        secondary: r.message ?? (r.success === false ? "failed" : "ok"),
        ts: r.created_at,
        bad: r.success === false,
      }))} />
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">{icon}{label}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function LogSection({ title, rows }: { title: string; rows: Array<{ id: string; primary: string; secondary: string; ts: string; bad?: boolean }> }) {
  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold">{title}</h2>
      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        {rows.length === 0 ? (
          <div className="p-4 text-xs text-muted-foreground">No recent activity.</div>
        ) : (
          <ul className="divide-y divide-border">
            {rows.map((r) => (
              <li key={r.id} className="flex items-start gap-3 px-4 py-3">
                <span className={"mt-1 inline-block h-2 w-2 shrink-0 rounded-full " + (r.bad ? "bg-destructive" : "bg-muted-foreground/40")} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{r.primary}</div>
                  <div className="truncate text-xs text-muted-foreground">{r.secondary}</div>
                </div>
                <div className="text-xs text-muted-foreground">{new Date(r.ts).toLocaleString()}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
