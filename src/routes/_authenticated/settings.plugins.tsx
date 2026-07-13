import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";
import { toast, Toaster } from "sonner";
import { Activity, Boxes, CheckCircle2, Loader2, Lock, Package, Play, Power, Settings2, ShieldCheck, Trash2, XCircle } from "lucide-react";

import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

import {
  listPlugins, installPlugin, uninstallPlugin, setPluginStatus,
  configurePlugin, verifyPlugin, testPluginModule, listPluginEvents,
  type InstalledPlugin,
} from "@/lib/plugins/plugins.functions";
import { isAdmin, claimFirstAdmin } from "@/lib/integrations/integrations.functions";

export const Route = createFileRoute("/_authenticated/settings/plugins")({
  head: () => ({
    meta: [
      { title: "Plugin Manager — Velora" },
      { name: "description", content: "Admin-only: install, configure, verify, and monitor every platform integration as a modular plugin." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PluginsPage,
});

const CONFIG_FIELDS = [
  { key: "client_id", label: "Client ID", secret: false },
  { key: "client_secret", label: "Client Secret", secret: true },
  { key: "access_token", label: "Access Token", secret: true },
  { key: "refresh_token", label: "Refresh Token", secret: true },
  { key: "api_key", label: "API Key", secret: true },
  { key: "base_url", label: "Base API URL", secret: false },
  { key: "api_version", label: "API Version", secret: false },
  { key: "oauth_authorize_url", label: "OAuth Authorize URL", secret: false },
  { key: "oauth_token_url", label: "OAuth Token URL", secret: false },
  { key: "scopes", label: "Scopes (comma-separated)", secret: false },
  { key: "webhook_secret", label: "Webhook Secret", secret: true },
  { key: "rate_limit_rpm", label: "Rate Limit (req/min)", secret: false },
  { key: "timeout_ms", label: "Timeout (ms)", secret: false },
  { key: "retry_count", label: "Retry Count", secret: false },
];

function PluginsPage() {
  const adminFn = useServerFn(isAdmin);
  const claimFn = useServerFn(claimFirstAdmin);
  const listFn = useServerFn(listPlugins);

  const adminQ = useQuery({ queryKey: ["is-admin"], queryFn: () => adminFn(), staleTime: 60_000 });
  const pluginsQ = useQuery({
    queryKey: ["plugins"], queryFn: () => listFn(),
    enabled: adminQ.data?.isAdmin === true,
    refetchInterval: 30_000,
  });

  const [selected, setSelected] = useState<InstalledPlugin | null>(null);
  const qc = useQueryClient();
  const refresh = () => qc.invalidateQueries({ queryKey: ["plugins"] });

  if (adminQ.isLoading) {
    return <Shell><div className="text-sm text-muted-foreground">Loading…</div></Shell>;
  }

  if (!adminQ.data?.isAdmin) {
    return (
      <Shell>
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-24 text-center">
          <Lock className="h-8 w-8 text-muted-foreground" />
          <h1 className="text-xl font-semibold">Admin access required</h1>
          <p className="text-sm text-muted-foreground">
            The Plugin Manager is admin-only. If you're the first user, claim admin here.
          </p>
          <Button
            onClick={async () => {
              const res = await claimFn();
              if (res.claimed) { toast.success("You are now admin"); adminQ.refetch(); }
              else toast.error("An admin already exists");
            }}
          >Claim first admin</Button>
        </div>
      </Shell>
    );
  }

  const installed = pluginsQ.data?.installed ?? [];
  const available = pluginsQ.data?.available ?? [];

  return (
    <Shell>
      <div className="mb-6 flex items-center gap-3">
        <Boxes className="h-6 w-6" />
        <div>
          <h1 className="text-2xl font-semibold">Plugin Manager</h1>
          <p className="text-sm text-muted-foreground">Modular platform integrations. The core knows nothing about them.</p>
        </div>
      </div>

      <Tabs defaultValue="installed">
        <TabsList>
          <TabsTrigger value="installed">Installed ({installed.length})</TabsTrigger>
          <TabsTrigger value="marketplace">Marketplace ({available.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="installed" className="mt-4">
          {installed.length === 0 ? (
            <EmptyState message="No plugins installed yet. Open the Marketplace to add one." />
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {installed.map((p) => (
                <InstalledCard key={p.slug} plugin={p} onOpen={() => setSelected(p)} onChange={refresh} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="marketplace" className="mt-4">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {available.map((p) => (
              <MarketplaceCard key={p.slug} plugin={p} onInstalled={refresh} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {selected && (
        <PluginDrawer
          key={selected.installation_id}
          plugin={selected}
          onClose={() => setSelected(null)}
          onChange={() => { refresh(); }}
        />
      )}
      <Toaster />
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

function MarketplaceCard({ plugin, onInstalled }: { plugin: any; onInstalled: () => void }) {
  const installFn = useServerFn(installPlugin);
  const m = useMutation({
    mutationFn: () => installFn({ data: { slug: plugin.slug } }),
    onSuccess: () => { toast.success(`${plugin.name} installed`); onInstalled(); },
    onError: (e: any) => toast.error(e.message ?? "Install failed"),
  });
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground shrink-0" />
            <h3 className="truncate font-medium">{plugin.name}</h3>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{plugin.developer} · v{plugin.version}</p>
        </div>
        {plugin.category && <Badge variant="secondary" className="shrink-0">{plugin.category}</Badge>}
      </div>
      {plugin.description && (
        <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{plugin.description}</p>
      )}
      <div className="mt-3 flex flex-wrap gap-1">
        {plugin.declared_modules.slice(0, 4).map((m: string) => (
          <Badge key={m} variant="outline" className="text-[10px]">{m}</Badge>
        ))}
        {plugin.declared_modules.length > 4 && (
          <Badge variant="outline" className="text-[10px]">+{plugin.declared_modules.length - 4}</Badge>
        )}
      </div>
      <Button size="sm" className="mt-3 w-full" onClick={() => m.mutate()} disabled={m.isPending}>
        {m.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Install"}
      </Button>
    </div>
  );
}

function InstalledCard({
  plugin, onOpen, onChange,
}: { plugin: InstalledPlugin; onOpen: () => void; onChange: () => void }) {
  const statusFn = useServerFn(setPluginStatus);
  const toggle = useMutation({
    mutationFn: () => statusFn({ data: {
      installation_id: plugin.installation_id,
      status: plugin.status === "enabled" ? "disabled" : "enabled",
    } }),
    onSuccess: () => { toast.success("Status updated"); onChange(); },
    onError: (e: any) => toast.error(e.message),
  });
  const score = plugin.health?.health_score ?? 0;
  const scoreColor = score >= 80 ? "text-emerald-600" : score >= 40 ? "text-amber-600" : "text-red-600";

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground shrink-0" />
            <h3 className="truncate font-medium">{plugin.name}</h3>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">v{plugin.version} · {plugin.developer}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge variant={plugin.status === "enabled" ? "default" : "secondary"}>
            {plugin.status}
          </Badge>
          {plugin.verified ? (
            <Badge variant="outline" className="gap-1 text-emerald-600">
              <ShieldCheck className="h-3 w-3" /> verified
            </Badge>
          ) : (
            <Badge variant="outline" className="text-amber-600">needs config</Badge>
          )}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
        <div>
          <p className="text-muted-foreground">Health</p>
          <p className={`font-medium ${scoreColor}`}>{score}%</p>
        </div>
        <div>
          <p className="text-muted-foreground">Latency</p>
          <p className="font-medium">{plugin.health?.avg_latency_ms ?? "—"}ms</p>
        </div>
        <div>
          <p className="text-muted-foreground">Online</p>
          <p className="font-medium">
            {plugin.health?.online ? <span className="text-emerald-600">yes</span> : <span className="text-muted-foreground">no</span>}
          </p>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <Button size="sm" variant="outline" className="flex-1" onClick={onOpen}>
          <Settings2 className="mr-1 h-3 w-3" /> Configure
        </Button>
        <Button size="sm" variant={plugin.status === "enabled" ? "secondary" : "default"}
          onClick={() => toggle.mutate()} disabled={toggle.isPending}>
          <Power className="mr-1 h-3 w-3" />
          {plugin.status === "enabled" ? "Disable" : "Enable"}
        </Button>
      </div>
    </div>
  );
}

function PluginDrawer({
  plugin, onClose, onChange,
}: { plugin: InstalledPlugin; onClose: () => void; onChange: () => void }) {
  const configureFn = useServerFn(configurePlugin);
  const verifyFn = useServerFn(verifyPlugin);
  const testFn = useServerFn(testPluginModule);
  const uninstallFn = useServerFn(uninstallPlugin);
  const eventsFn = useServerFn(listPluginEvents);

  // Start config from the masked view so admins can see keys exist; they overwrite to change.
  const [config, setConfig] = useState<Record<string, string>>(() => {
    const out: Record<string, string> = {};
    for (const f of CONFIG_FIELDS) {
      const v = plugin.config_masked[f.key];
      if (typeof v === "string") out[f.key] = f.secret ? "" : v;
    }
    return out;
  });
  const [tab, setTab] = useState("config");

  const eventsQ = useQuery({
    queryKey: ["plugin-events", plugin.installation_id],
    queryFn: () => eventsFn({ data: { installation_id: plugin.installation_id } }),
    enabled: tab === "logs",
  });

  const save = useMutation({
    mutationFn: () => {
      const clean: Record<string, any> = {};
      for (const [k, v] of Object.entries(config)) if (v && v.length > 0) clean[k] = v;
      return configureFn({ data: { installation_id: plugin.installation_id, config: clean } });
    },
    onSuccess: () => { toast.success("Configuration saved"); onChange(); },
    onError: (e: any) => toast.error(e.message),
  });

  const verify = useMutation({
    mutationFn: () => verifyFn({ data: { installation_id: plugin.installation_id } }),
    onSuccess: (res) => {
      toast[res.verified ? "success" : "error"](res.verified ? "All checks passed" : "Verification failed");
      onChange();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const [testResult, setTestResult] = useState<Record<string, any>>({});
  const runTest = async (mod: string) => {
    try {
      const res = await testFn({ data: { installation_id: plugin.installation_id, module: mod } });
      setTestResult((prev) => ({ ...prev, [mod]: res }));
      onChange();
    } catch (e: any) { toast.error(e.message); }
  };

  const uninstall = useMutation({
    mutationFn: () => uninstallFn({ data: { installation_id: plugin.installation_id } }),
    onSuccess: () => { toast.success("Uninstalled"); onChange(); onClose(); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" /> {plugin.name}
            <Badge variant="outline">v{plugin.version}</Badge>
            {plugin.verified && <Badge variant="outline" className="text-emerald-600 gap-1"><ShieldCheck className="h-3 w-3" />verified</Badge>}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="config">Configuration</TabsTrigger>
            <TabsTrigger value="test">Tester</TabsTrigger>
            <TabsTrigger value="health">Health</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="mt-3 max-h-[60vh] overflow-y-auto pr-1">
            <p className="mb-3 text-xs text-muted-foreground">
              Modules declared: {plugin.declared_modules.join(", ")}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {CONFIG_FIELDS.map((f) => (
                <div key={f.key}>
                  <Label className="text-xs">{f.label}</Label>
                  <Input
                    type={f.secret ? "password" : "text"}
                    placeholder={f.secret && plugin.config_masked[f.key] ? String(plugin.config_masked[f.key]) : ""}
                    value={config[f.key] ?? ""}
                    onChange={(e) => setConfig((c) => ({ ...c, [f.key]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="test" className="mt-3 space-y-2">
            <p className="text-xs text-muted-foreground">Run a smoke test against any enabled module.</p>
            {plugin.enabled_modules.map((mod) => {
              const r = testResult[mod];
              return (
                <div key={mod} className="flex items-center justify-between rounded border border-border p-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs">{mod}</span>
                    {r && (r.success
                      ? <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      : <XCircle className="h-4 w-4 text-red-600" />)}
                    {r && <span className="text-xs text-muted-foreground">{r.status_code} · {r.latency_ms}ms · {r.message}</span>}
                  </div>
                  <Button size="sm" variant="outline" onClick={() => runTest(mod)}>
                    <Play className="mr-1 h-3 w-3" /> Test
                  </Button>
                </div>
              );
            })}
          </TabsContent>

          <TabsContent value="health" className="mt-3 space-y-2 text-sm">
            <HealthRow label="Online" value={plugin.health?.online ? "yes" : "no"} />
            <HealthRow label="Health score" value={`${plugin.health?.health_score ?? 0}%`} />
            <HealthRow label="Avg latency" value={plugin.health?.avg_latency_ms != null ? `${plugin.health.avg_latency_ms} ms` : "—"} />
            <HealthRow label="Authentication" value={plugin.health?.auth_ok ? "ok" : "failing"} />
            <HealthRow label="Webhook" value={plugin.health?.webhook_ok ? "ok" : "failing"} />
            <HealthRow label="Last success" value={plugin.health?.last_success_at ?? "—"} />
            <HealthRow label="Last error" value={plugin.health?.last_error_message ?? "—"} />
            <HealthRow label="Verified at" value={plugin.last_verified_at ?? "—"} />
          </TabsContent>

          <TabsContent value="logs" className="mt-3 max-h-[60vh] overflow-y-auto">
            <div className="space-y-1 font-mono text-xs">
              {(eventsQ.data ?? []).map((e: any) => (
                <div key={e.id} className="flex gap-2 rounded border border-border/50 p-2">
                  <span className="text-muted-foreground">{new Date(e.created_at).toLocaleString()}</span>
                  <span className={e.success === false ? "text-red-600" : "text-foreground"}>{e.event_type}</span>
                  {e.module && <span className="text-muted-foreground">[{e.module}]</span>}
                  {e.message && <span className="truncate text-muted-foreground">— {e.message}</span>}
                </div>
              ))}
              {eventsQ.data && eventsQ.data.length === 0 && (
                <p className="text-muted-foreground">No events yet.</p>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex flex-row items-center justify-between sm:justify-between">
          <Button variant="destructive" size="sm" onClick={() => uninstall.mutate()} disabled={uninstall.isPending}>
            <Trash2 className="mr-1 h-3 w-3" /> Uninstall
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => verify.mutate()} disabled={verify.isPending}>
              <ShieldCheck className="mr-1 h-3 w-3" /> Verify
            </Button>
            <Button size="sm" onClick={() => save.mutate()} disabled={save.isPending}>
              {save.isPending ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Activity className="mr-1 h-3 w-3" />}
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function HealthRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border/50 py-1.5">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono text-xs">{value}</span>
    </div>
  );
}
