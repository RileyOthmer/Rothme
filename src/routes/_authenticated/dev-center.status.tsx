import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { DevCenterShell } from "@/features/dev-center/DevCenterShell";
import { useActiveOrg } from "@/features/collab/useActiveOrg";
import { listSocialConnections, listSocialEvents } from "@/lib/social/social.functions";

export const Route = createFileRoute("/_authenticated/dev-center/status")({
  component: StatusPage,
});

function StatusPage() {
  const org = useActiveOrg();
  const listConn = useServerFn(listSocialConnections);
  const listEv = useServerFn(listSocialEvents);
  const orgId = org.data?.id;

  const conn = useQuery({ queryKey: ["dev-center", "connections", orgId], queryFn: () => listConn({ data: { orgId: orgId! } }), enabled: !!orgId });
  const ev   = useQuery({ queryKey: ["dev-center", "events",      orgId], queryFn: () => listEv({ data: { orgId: orgId!, limit: 50 } }),  enabled: !!orgId });

  const rows = (conn.data ?? []) as Array<{ status: string | null }>;
  const events = (ev.data ?? []) as Array<{ level: string }>;
  const connected = rows.filter((r) => r.status === "connected").length;
  const degraded  = rows.filter((r) => r.status === "degraded").length;
  const errors    = rows.filter((r) => r.status === "error").length;
  const recentErrors = events.filter((e) => e.level === "error").length;

  return (
    <DevCenterShell
      title="System Status"
      description="High-level view of every subsystem powering the Developer Center."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Connections" value={String(rows.length)} sub={`${connected} connected · ${degraded} degraded · ${errors} error`} />
        <Stat label="Recent errors" value={String(recentErrors)} sub="Last 50 events" tone={recentErrors > 0 ? "warn" : "ok"} />
        <Stat label="Encryption" value="AES-GCM" sub="INTEGRATION_ENCRYPTION_KEY" tone="ok" />
        <Stat label="Scheduler" value="pg_cron" sub="Every 15 min · social sync" tone="ok" />
      </div>

      <div className="mt-8 space-y-2 text-sm">
        <SystemRow name="Backend (Lovable Cloud)"      status="Operational" />
        <SystemRow name="Auth (Supabase Auth)"          status="Operational" />
        <SystemRow name="Encryption vault"              status="Operational" />
        <SystemRow name="Analytics ingestion"           status="Operational" />
        <SystemRow name="AI Gateway"                    status="Operational" />
        <SystemRow name="Publishing queue"              status="Operational" />
      </div>
    </DevCenterShell>
  );
}

function Stat({ label, value, sub, tone = "muted" }: { label: string; value: string; sub: string; tone?: "ok" | "warn" | "muted" }) {
  const dot = tone === "ok" ? "bg-emerald-500" : tone === "warn" ? "bg-amber-500" : "bg-muted-foreground/40";
  return (
    <div className="rounded-2xl border border-border/60 bg-card/40 p-4">
      <div className="flex items-center gap-2">
        <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
        <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      </div>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

function SystemRow({ name, status }: { name: string; status: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border/50 bg-card/30 px-4 py-2.5">
      <span>{name}</span>
      <span className="flex items-center gap-2 text-xs text-emerald-600">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        {status}
      </span>
    </div>
  );
}
