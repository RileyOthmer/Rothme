import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { DevCenterShell } from "@/features/dev-center/DevCenterShell";
import { DEV_PLATFORMS, type DevPlatform } from "@/lib/dev-center/social-platforms";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useActiveOrg } from "@/features/collab/useActiveOrg";
import { listSocialConnections, pingSocialConnection } from "@/lib/social/social.functions";
import { CheckCircle2, PlugZap, Settings, Activity, RefreshCw, LineChart, ScrollText, Unplug } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dev-center/integrations")({
  component: IntegrationsPage,
});

type ConnRow = {
  id: string; platform: string; status: string | null;
  health_score: number | null; last_synced_at: string | null;
  external_handle: string | null;
};

function IntegrationsPage() {
  const org = useActiveOrg();
  const listFn = useServerFn(listSocialConnections);
  const orgId = org.data?.id ?? "";
  const q = useQuery({
    queryKey: ["dev-center", "connections", orgId],
    queryFn: () => listFn({ data: { orgId } }),
    enabled: !!orgId,
  });

  const byPlatform = new Map<string, ConnRow>();
  for (const c of (q.data ?? []) as ConnRow[]) byPlatform.set(c.platform, c);

  return (
    <DevCenterShell
      title="Integrations"
      description="Every supported platform. Connect through the official OAuth flow — tokens are stored encrypted on the backend and never exposed to the browser."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {DEV_PLATFORMS.map((p) => (
          <PlatformCard key={p.id} platform={p} conn={p.connectionKey ? byPlatform.get(p.connectionKey) : undefined} orgName={org.data?.name} />
        ))}
      </div>
    </DevCenterShell>
  );
}

function PlatformCard({ platform, conn, orgName }: { platform: DevPlatform; conn?: ConnRow; orgName?: string }) {
  const connected = !!conn && conn.status === "connected";
  const health = conn?.health_score ?? null;
  const pingFn = useServerFn(pingSocialConnection);

  async function onTest() {
    if (!conn) { toast.error("Connect this platform first"); return; }
    toast.promise(pingFn({ data: { connectionId: conn.id } }).then((r) => {
      if (!r.ok) throw new Error(r.error ?? "Test failed");
      return r;
    }), { loading: "Testing…", success: "Connection healthy", error: (e) => (e as Error).message });
  }

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card/40 p-5">
      <header className="flex items-start gap-3">
        <div
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-sm font-semibold text-white"
          style={{ background: platform.brandColor }}
          aria-hidden
        >{platform.mark}</div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-base font-semibold">{platform.name}</h3>
            {connected ? (
              <Badge variant="outline" className="rounded-full text-emerald-600 border-emerald-500/40">
                <CheckCircle2 className="mr-1 h-3 w-3" /> Connected
              </Badge>
            ) : (
              <Badge variant="outline" className="rounded-full text-muted-foreground">Not connected</Badge>
            )}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">API {platform.apiVersion} · {platform.category}</p>
        </div>
      </header>

      <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
        <Field label="Health" value={health == null ? "—" : `${health}/100`} />
        <Field label="Last sync" value={conn?.last_synced_at ? new Date(conn.last_synced_at).toLocaleString() : "—"} />
        <Field label="Account" value={conn?.external_handle ?? "—"} />
        <Field label="Workspace" value={orgName ?? "—"} />
      </dl>

      <div className="flex flex-wrap gap-2 pt-1">
        {connected ? (
          <>
            <IconBtn to={`/dev-center/connections`} icon={Settings}>Configure</IconBtn>
            <Button size="sm" variant="outline" onClick={onTest}><Activity className="mr-1.5 h-3.5 w-3.5" />Test</Button>
            <IconBtn to={`/dev-center/sync`} icon={RefreshCw}>Sync</IconBtn>
            <IconBtn to={`/dev-center/analytics-mapping`} icon={LineChart}>Analytics</IconBtn>
            <IconBtn to={`/dev-center/logs`} icon={ScrollText}>Logs</IconBtn>
            <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive"><Unplug className="mr-1.5 h-3.5 w-3.5" />Disconnect</Button>
          </>
        ) : (
          <Button size="sm" onClick={() => toast.info(`OAuth for ${platform.name} launches from Settings → Connections`)}>
            <PlugZap className="mr-1.5 h-3.5 w-3.5" />Connect
          </Button>
        )}
      </div>
    </article>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="truncate text-right font-medium">{value}</dd>
    </>
  );
}

function IconBtn({ to, icon: Icon, children }: { to: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <Button asChild size="sm" variant="outline">
      <Link to={to}><Icon className="mr-1.5 h-3.5 w-3.5" />{children}</Link>
    </Button>
  );
}
