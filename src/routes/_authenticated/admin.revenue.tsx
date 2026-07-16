import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getRevenueStats } from "@/lib/admin/stats.functions";

export const Route = createFileRoute("/_authenticated/admin/revenue")({
  component: RevenuePage,
});

function RevenuePage() {
  const fn = useServerFn(getRevenueStats);
  const [env, setEnv] = useState<"live" | "sandbox">("live");
  const q = useQuery({
    queryKey: ["admin", "revenue", env],
    queryFn: () => fn({ data: { environment: env } }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Subscriptions</h2>
        <div className="inline-flex rounded-lg border border-border bg-surface p-0.5 text-xs">
          {(["live", "sandbox"] as const).map((e) => (
            <button
              key={e}
              onClick={() => setEnv(e)}
              className={"rounded-md px-3 py-1 " + (env === e ? "bg-background font-medium shadow-xs" : "text-muted-foreground")}
            >
              {e === "live" ? "Live" : "Test"}
            </button>
          ))}
        </div>
      </div>

      {q.isLoading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : q.error ? (
        <div className="text-sm text-destructive">{(q.error as Error).message}</div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-5">
            <Stat label="Total" value={q.data!.total} />
            <Stat label="Active" value={q.data!.active} accent />
            <Stat label="Trialing" value={q.data!.trialing} />
            <Stat label="Past due" value={q.data!.pastDue} />
            <Stat label="Canceled" value={q.data!.canceled} />
          </div>

          <section>
            <h3 className="mb-3 text-sm font-semibold">Active by plan</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {q.data!.byPlan.length === 0 ? (
                <div className="rounded-xl border border-border bg-surface p-4 text-xs text-muted-foreground">No active subscriptions.</div>
              ) : q.data!.byPlan.map((p) => (
                <div key={p.label} className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 text-sm">
                  <span>{p.label}</span>
                  <span className="font-semibold tabular-nums">{p.count}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold">Latest events</h3>
            <div className="overflow-hidden rounded-xl border border-border bg-surface">
              <table className="w-full text-sm">
                <thead className="bg-surface-2/50 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Email</th>
                    <th className="px-3 py-2 text-left font-medium">Plan</th>
                    <th className="px-3 py-2 text-left font-medium">Status</th>
                    <th className="px-3 py-2 text-left font-medium">Period end</th>
                    <th className="px-3 py-2 text-left font-medium">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {q.data!.recent.length === 0 ? (
                    <tr><td colSpan={5} className="px-3 py-6 text-center text-xs text-muted-foreground">No subscriptions.</td></tr>
                  ) : q.data!.recent.map((r) => (
                    <tr key={r.id} className="border-t border-border">
                      <td className="px-3 py-2 text-xs">{r.customer_email ?? "—"}</td>
                      <td className="px-3 py-2 text-xs">{r.plan ?? "—"} · {r.billing_cycle ?? "—"}</td>
                      <td className="px-3 py-2 text-xs"><StatusBadge status={r.status ?? "unknown"} /></td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">{r.current_period_end ? new Date(r.current_period_end).toLocaleDateString() : "—"}</td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">{r.updated_at ? new Date(r.updated_at).toLocaleString() : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className={"rounded-xl border p-4 " + (accent ? "border-emerald-500/30 bg-emerald-500/5" : "border-border bg-surface")}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">{value.toLocaleString()}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const color =
    status === "active" ? "bg-emerald-500/10 text-emerald-500" :
    status === "trialing" ? "bg-blue-500/10 text-blue-500" :
    status === "past_due" ? "bg-amber-500/10 text-amber-500" :
    status === "canceled" ? "bg-muted text-muted-foreground" :
    "bg-muted text-muted-foreground";
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${color}`}>{status}</span>;
}
