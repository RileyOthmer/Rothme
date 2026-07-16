import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Users, DollarSign, Network, Activity, TrendingDown, TrendingUp, KeyRound,
  UserPlus, AlertTriangle, ServerCog, Wallet, Lock, MessageSquare, Cpu,
  Mail, MessageCircle, Flag, LifeBuoy, Server, ShieldCheck,
} from "lucide-react";
import {
  getUserStats, getConnectionStats, getHealthStats,
  getFinancialStats, getRecentCancellations,
} from "@/lib/admin/stats.functions";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminOverview,
});

function AdminOverview() {
  const users = useServerFn(getUserStats);
  const fin = useServerFn(getFinancialStats);
  const conns = useServerFn(getConnectionStats);
  const health = useServerFn(getHealthStats);
  const cancels = useServerFn(getRecentCancellations);

  const qUsers = useQuery({ queryKey: ["admin", "users", "overview"], queryFn: () => users({}) });
  const qFin = useQuery({ queryKey: ["admin", "financial", "overview"], queryFn: () => fin({ data: { environment: "live" } }) });
  const qConns = useQuery({ queryKey: ["admin", "connections", "overview"], queryFn: () => conns({}) });
  const qHealth = useQuery({ queryKey: ["admin", "health", "overview"], queryFn: () => health({}) });
  const qCancels = useQuery({ queryKey: ["admin", "cancellations"], queryFn: () => cancels({ data: { environment: "live" } }) });

  const currency = (n: number) => n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

  const recentErrors = qHealth.data
    ? (qHealth.data.syncErrors.length + qHealth.data.integrationLogs.filter((l) => l.success === false).length)
    : null;
  const totalIntegrations = qConns.data?.platforms.reduce((n, p) => n + p.total, 0) ?? null;

  return (
    <div className="space-y-6">
      {/* KPI hero */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          tone="primary"
          icon={<Wallet className="h-4 w-4" />}
          label="Monthly Recurring Revenue"
          value={qFin.data ? currency(qFin.data.mrrUsd) : null}
          sub={qFin.data ? `${qFin.data.activeSubscribers} active subscribers` : "—"}
        />
        <Kpi
          icon={<TrendingUp className="h-4 w-4" />}
          label="Annual Recurring Revenue"
          value={qFin.data ? currency(qFin.data.arrUsd) : null}
          sub={qFin.data ? `Projected from MRR × 12` : "—"}
        />
        <Kpi
          icon={<TrendingDown className="h-4 w-4" />}
          label="Churn Rate (30d)"
          value={qFin.data ? pct(qFin.data.churnRate) : null}
          sub={qFin.data ? `${qFin.data.churned30d} cancellations` : "—"}
          intent={qFin.data && qFin.data.churnRate > 0.05 ? "warn" : "neutral"}
        />
        <Kpi
          icon={<Users className="h-4 w-4" />}
          label="Total Users"
          value={qUsers.data?.total ?? null}
          sub={qUsers.data ? `+${qUsers.data.newLast7} this week · +${qUsers.data.newLast30} this month` : "—"}
        />
      </section>

      {/* Secondary stats */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={<DollarSign className="h-4 w-4" />} label="Active subscribers" value={qFin.data?.activeSubscribers ?? null} sub={qFin.data ? `${qFin.data.trialing} trialing · ${qFin.data.pastDue} past due` : "—"} to="/admin/revenue" />
        <Stat icon={<Network className="h-4 w-4" />} label="Connected integrations" value={totalIntegrations} sub={qConns.data ? `${qConns.data.syncs7d.success}/${qConns.data.syncs7d.total} syncs OK (7d)` : "—"} to="/admin/connections" />
        <Stat icon={<AlertTriangle className="h-4 w-4" />} label="Recent errors" value={recentErrors} sub={qHealth.data ? `Across sync + integrations` : "—"} to="/admin/health" intent={recentErrors && recentErrors > 0 ? "warn" : "neutral"} />
        <Stat icon={<Activity className="h-4 w-4" />} label="System health" value={qHealth.data ? (recentErrors === 0 ? "Healthy" : "Degraded") : null} sub={qHealth.data ? `${qHealth.data.aiAudits7d} AI audits (7d)` : "—"} to="/admin/health" />
      </section>

      {/* Two-column: recent signups + cancellations */}
      <section className="grid gap-4 lg:grid-cols-2">
        <Panel title="Recent user signups" icon={<UserPlus className="h-4 w-4" />} action={<Link to="/admin/users" className="text-xs text-muted-foreground hover:text-foreground">View all →</Link>}>
          {qUsers.isLoading ? <Skel rows={5} /> : qUsers.data && qUsers.data.recent.length > 0 ? (
            <ul className="divide-y divide-border">
              {qUsers.data.recent.slice(0, 6).map((u) => (
                <li key={u.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <div className="min-w-0">
                    <div className="truncate font-medium">{u.full_name || "Unnamed"}</div>
                    <div className="truncate text-xs text-muted-foreground">{u.business_name || "—"}</div>
                  </div>
                  <div className="shrink-0 text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</div>
                </li>
              ))}
            </ul>
          ) : <Empty>No signups yet.</Empty>}
        </Panel>

        <Panel title="Subscription cancellations" icon={<TrendingDown className="h-4 w-4" />} action={<Link to="/admin/revenue" className="text-xs text-muted-foreground hover:text-foreground">View all →</Link>}>
          {qCancels.isLoading ? <Skel rows={5} /> : qCancels.data && qCancels.data.length > 0 ? (
            <ul className="divide-y divide-border">
              {qCancels.data.slice(0, 6).map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <div className="min-w-0">
                    <div className="truncate font-medium">{s.customer_email ?? "—"}</div>
                    <div className="truncate text-xs text-muted-foreground">
                      {s.status === "canceled" ? "Canceled" : "Cancel at period end"}
                      {s.current_period_end ? ` · ends ${new Date(s.current_period_end).toLocaleDateString()}` : ""}
                    </div>
                  </div>
                  <div className="shrink-0 text-xs text-muted-foreground">{s.updated_at ? new Date(s.updated_at).toLocaleDateString() : ""}</div>
                </li>
              ))}
            </ul>
          ) : <Empty>No cancellations yet.</Empty>}
        </Panel>
      </section>

      {/* Recent errors */}
      <Panel title="Recent errors" icon={<AlertTriangle className="h-4 w-4" />} action={<Link to="/admin/health" className="text-xs text-muted-foreground hover:text-foreground">Full log →</Link>}>
        {qHealth.isLoading ? <Skel rows={4} /> : qHealth.data && (qHealth.data.syncErrors.length + qHealth.data.integrationLogs.filter((l) => l.success === false).length) > 0 ? (
          <ul className="divide-y divide-border">
            {[
              ...qHealth.data.syncErrors.slice(0, 3).map((e) => ({ id: e.id, source: e.kind, msg: e.error_message ?? "(no message)", at: e.created_at })),
              ...qHealth.data.integrationLogs.filter((l) => l.success === false).slice(0, 3).map((l) => ({ id: l.id, source: l.platform, msg: l.message ?? l.event_type, at: l.created_at })),
            ].map((row) => (
              <li key={row.id} className="flex items-start justify-between gap-3 py-2 text-sm">
                <div className="min-w-0">
                  <div className="text-xs font-medium uppercase tracking-wide text-destructive">{row.source}</div>
                  <div className="truncate text-sm text-foreground">{row.msg}</div>
                </div>
                <div className="shrink-0 text-xs text-muted-foreground">{new Date(row.at).toLocaleTimeString()}</div>
              </li>
            ))}
          </ul>
        ) : <Empty>No errors reported. System looks healthy.</Empty>}
      </Panel>

      {/* Quick admin shortcuts */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <QuickLink to="/admin/credentials" icon={<KeyRound className="h-4 w-4" />} title="Platform credentials" desc="OAuth client IDs and secrets" />
        <QuickLink to="/admin/users" icon={<Users className="h-4 w-4" />} title="Users" desc="Signups, activity, and roles" />
        <QuickLink to="/admin/revenue" icon={<DollarSign className="h-4 w-4" />} title="Subscriptions & revenue" desc="Stripe activity and invoices" />
        <QuickLink to="/admin/connections" icon={<Network className="h-4 w-4" />} title="Integrations" desc="Social account health per platform" />
        <QuickLink to="/admin/health" icon={<ServerCog className="h-4 w-4" />} title="System health" desc="Sync errors, plugin events, AI audits" />
      </section>

      {/* Data sources not wired yet — no fake numbers */}
      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Coming soon</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Placeholder icon={<Cpu className="h-4 w-4" />} label="AI Usage" note="Needs an ai_usage events table" />
          <Placeholder icon={<Server className="h-4 w-4" />} label="Total API Requests" note="Needs request logging" />
          <Placeholder icon={<Mail className="h-4 w-4" />} label="Email Delivery" note="Connect Resend to enable" />
          <Placeholder icon={<MessageCircle className="h-4 w-4" />} label="SMS Delivery" note="Connect Twilio to enable" />
          <Placeholder icon={<ShieldCheck className="h-4 w-4" />} label="OAuth Status" note="Aggregation from oauth_states" />
          <Placeholder icon={<Flag className="h-4 w-4" />} label="Feature Flags" note="Needs a feature_flags table" />
          <Placeholder icon={<LifeBuoy className="h-4 w-4" />} label="Support Tickets" note="Needs a support integration" />
          <Placeholder icon={<MessageSquare className="h-4 w-4" />} label="Announcements" note="Needs an announcements table" />
          <Placeholder icon={<Lock className="h-4 w-4" />} label="Impersonation" note="Deferred — requires audit trail" />
        </div>
      </section>
    </div>
  );
}

/* ---------------- primitives ---------------- */

function Kpi({ icon, label, value, sub, tone = "default", intent = "neutral" }: {
  icon: React.ReactNode; label: string; value: React.ReactNode; sub: string;
  tone?: "default" | "primary"; intent?: "neutral" | "warn";
}) {
  return (
    <div className={"relative overflow-hidden rounded-2xl border p-4 " + (tone === "primary" ? "border-primary/30 bg-gradient-to-br from-primary/5 to-transparent" : "border-border bg-surface")}>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">{icon}{label}</div>
      <div className={"mt-2 text-3xl font-semibold tabular-nums " + (intent === "warn" ? "text-amber-600 dark:text-amber-400" : "")}>
        {value ?? <span className="inline-block h-8 w-24 animate-pulse rounded bg-muted" />}
      </div>
      <div className="mt-1 text-xs text-muted-foreground">{sub}</div>
    </div>
  );
}

function Stat({ icon, label, value, sub, to, intent = "neutral" }: {
  icon: React.ReactNode; label: string; value: React.ReactNode; sub: string; to: string; intent?: "neutral" | "warn";
}) {
  return (
    <Link to={to} className="block rounded-xl border border-border bg-surface p-4 transition-colors hover:bg-surface-2">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">{icon}{label}</div>
      <div className={"mt-2 text-2xl font-semibold tabular-nums " + (intent === "warn" ? "text-amber-600 dark:text-amber-400" : "")}>
        {value ?? <span className="inline-block h-7 w-16 animate-pulse rounded bg-muted" />}
      </div>
      <div className="mt-1 text-xs text-muted-foreground">{sub}</div>
    </Link>
  );
}

function Panel({ title, icon, action, children }: { title: string; icon: React.ReactNode; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-surface">
      <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-2 text-sm font-medium">{icon}{title}</div>
        {action}
      </header>
      <div className="px-4 py-2">{children}</div>
    </section>
  );
}

function QuickLink({ to, icon, title, desc }: { to: string; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <Link to={to} className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4 transition-colors hover:bg-surface-2">
      <div className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-background text-muted-foreground">{icon}</div>
      <div className="min-w-0">
        <div className="truncate text-sm font-medium">{title}</div>
        <div className="truncate text-xs text-muted-foreground">{desc}</div>
      </div>
    </Link>
  );
}

function Placeholder({ icon, label, note }: { icon: React.ReactNode; label: string; note: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border/60 bg-surface/50 p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">{icon}{label}</div>
      <div className="mt-2 text-sm text-muted-foreground">{note}</div>
    </div>
  );
}

function Skel({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-2 py-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-8 animate-pulse rounded bg-muted" />
      ))}
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="py-6 text-center text-xs text-muted-foreground">{children}</div>;
}
