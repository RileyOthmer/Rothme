import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getUserStats, getRevenueStats, getConnectionStats, getHealthStats } from "@/lib/admin/stats.functions";
import { KeyRound, Users, DollarSign, Network, Activity } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminOverview,
});

function AdminOverview() {
  const users = useServerFn(getUserStats);
  const rev = useServerFn(getRevenueStats);
  const conns = useServerFn(getConnectionStats);
  const health = useServerFn(getHealthStats);

  const qUsers = useQuery({ queryKey: ["admin", "users", "overview"], queryFn: () => users({}) });
  const qRev = useQuery({ queryKey: ["admin", "revenue", "overview"], queryFn: () => rev({ data: { environment: "live" } }) });
  const qConns = useQuery({ queryKey: ["admin", "connections", "overview"], queryFn: () => conns({}) });
  const qHealth = useQuery({ queryKey: ["admin", "health", "overview"], queryFn: () => health({}) });

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card
        icon={<Users className="h-4 w-4" />}
        label="Total users"
        value={qUsers.data?.total ?? "—"}
        sub={qUsers.data ? `+${qUsers.data.newLast7} this week` : "Loading…"}
        to="/admin/users"
      />
      <Card
        icon={<DollarSign className="h-4 w-4" />}
        label="Active subscriptions"
        value={qRev.data?.active ?? "—"}
        sub={qRev.data ? `${qRev.data.trialing} trialing · ${qRev.data.pastDue} past due` : "Loading…"}
        to="/admin/revenue"
      />
      <Card
        icon={<Network className="h-4 w-4" />}
        label="Connected accounts"
        value={qConns.data?.platforms.reduce((n, p) => n + p.total, 0) ?? "—"}
        sub={qConns.data ? `${qConns.data.syncs7d.success}/${qConns.data.syncs7d.total} syncs OK (7d)` : "Loading…"}
        to="/admin/connections"
      />
      <Card
        icon={<Activity className="h-4 w-4" />}
        label="Errors (recent)"
        value={qHealth.data ? qHealth.data.syncErrors.length + qHealth.data.integrationLogs.filter((l) => l.success === false).length : "—"}
        sub={qHealth.data ? `${qHealth.data.aiAudits7d} AI audits (7d)` : "Loading…"}
        to="/admin/health"
      />

      <div className="col-span-full mt-2 flex items-center justify-between rounded-xl border border-border bg-surface p-4">
        <div className="flex items-center gap-3">
          <KeyRound className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="text-sm font-medium">Platform OAuth credentials</div>
            <div className="text-xs text-muted-foreground">Set client IDs and secrets for every connectable platform.</div>
          </div>
        </div>
        <Link to="/admin/credentials" className="inline-flex h-8 items-center rounded-md border border-border bg-background px-3 text-xs font-medium">Open</Link>
      </div>
    </div>
  );
}

function Card({ icon, label, value, sub, to }: { icon: React.ReactNode; label: string; value: React.ReactNode; sub: string; to: string }) {
  return (
    <Link to={to} className="block rounded-xl border border-border bg-surface p-4 transition-colors hover:bg-surface-2">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">{icon}{label}</div>
      <div className="mt-2 text-2xl font-semibold tabular-nums">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{sub}</div>
    </Link>
  );
}
