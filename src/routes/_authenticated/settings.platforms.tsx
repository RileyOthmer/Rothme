import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast, Toaster } from "sonner";
import {
  RefreshCw, Link2, Link2Off, Search, Loader2, CheckCircle2,
  AlertTriangle, Clock, Sparkles, ChevronDown, ChevronUp, ShieldCheck, XCircle,
} from "lucide-react";

import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { PLATFORMS as SOCIAL_PLATFORMS } from "@/lib/social-connections/platforms";
import {
  listSocialAccounts, listPlatformStatuses, startConnect,
  disconnectAccount, refreshAccount, triggerSync,
} from "@/lib/social-connections/social-connections.functions";
import {
  PROVIDERS, PROVIDER_META, listConnections, connectProvider, disconnectProvider,
  type Provider,
} from "@/lib/connections.functions";
import { INTEGRATIONS } from "@/features/integrations/registry";

type UnifiedStatus = "connected" | "syncing" | "needs_reauth" | "error" | "not_connected" | "coming_soon";

type MissingGroup = { feature: string; reason: string; scopes: string[] };
type Capabilities = {
  granted: string[];
  required: string[];
  missing: MissingGroup[];
  publishingReady: boolean;
  analyticsReady: boolean;
  healthy: boolean;
  healthReason?: string;
};

type Row = {
  key: string;
  platformId: string;
  platformName: string;
  category: string;
  brandColor: string;
  mark: string;
  kind: "social" | "provider" | "coming_soon";
  connectedAccount: string | null;
  status: UnifiedStatus;
  lastSync: string | null;
  accountId?: string;
  providerId?: Provider;
  capabilities?: Capabilities;
};

// ------- Capability heuristics ------------------------------------------------

const PUBLISH_RE = /publish|write|content_publish|w_member_social|business\.manage|tweet\.write|video\.publish|manage_posts/i;
const ANALYTICS_RE = /insight|analytic|read(?!.*write)|readonly|basic|show_list|manage_insights|users\.read|tweet\.read|list/i;

function classifyScope(s: string): "publish" | "analytics" | "identity" {
  if (PUBLISH_RE.test(s)) return "publish";
  if (ANALYTICS_RE.test(s)) return "analytics";
  return "identity";
}

/** Human-readable reason we'd request each capability group. */
function reasonFor(feature: "publish" | "analytics", platformName: string): string {
  if (feature === "publish") {
    return `Rothme needs write access on ${platformName} so you can schedule and publish posts from the composer without leaving the app.`;
  }
  return `Rothme needs read access on ${platformName} to pull post reach, engagement, and follower data into your dashboards and AI insights.`;
}

function deriveSocialCapabilities(
  platformName: string,
  requiredScopes: string[],
  grantedScopes: string[] | null | undefined,
  status: UnifiedStatus,
  lastError: string | null | undefined,
  tokenExpiration: string | null | undefined,
): Capabilities {
  const granted = grantedScopes ?? [];
  const grantedSet = new Set(granted);
  const missingPub: string[] = [];
  const missingAn: string[] = [];
  let hasPubReq = false, hasAnReq = false;
  let hasPubGranted = false, hasAnGranted = false;

  for (const s of requiredScopes) {
    const kind = classifyScope(s);
    if (kind === "publish") hasPubReq = true;
    if (kind === "analytics") hasAnReq = true;
    if (!grantedSet.has(s)) {
      if (kind === "publish") missingPub.push(s);
      else if (kind === "analytics") missingAn.push(s);
    }
  }
  for (const s of granted) {
    const kind = classifyScope(s);
    if (kind === "publish") hasPubGranted = true;
    if (kind === "analytics") hasAnGranted = true;
  }

  const missing: MissingGroup[] = [];
  if (missingPub.length) {
    missing.push({ feature: "Publishing", reason: reasonFor("publish", platformName), scopes: missingPub });
  }
  if (missingAn.length) {
    missing.push({ feature: "Analytics", reason: reasonFor("analytics", platformName), scopes: missingAn });
  }

  const expired = tokenExpiration ? new Date(tokenExpiration).getTime() < Date.now() : false;
  const healthy = status === "connected" && !lastError && !expired;
  const healthReason = expired
    ? "Access token has expired — reconnect to restore access."
    : lastError
      ? lastError
      : status === "needs_reauth"
        ? "The platform revoked or expired this connection — reconnect to continue."
        : status === "error"
          ? "Last sync failed — check the platform and reconnect if needed."
          : undefined;

  return {
    granted,
    required: requiredScopes,
    missing,
    publishingReady: hasPubReq ? hasPubGranted && missingPub.length === 0 : hasPubGranted,
    analyticsReady: hasAnReq ? hasAnGranted && missingAn.length === 0 : hasAnGranted,
    healthy,
    healthReason,
  };
}

function deriveProviderCapabilities(connected: boolean, platformName: string): Capabilities {
  // Providers in PROVIDER_META are analytics-only (Ads / GA4 / Shopify / Mailchimp).
  return {
    granted: connected ? ["Read analytics"] : [],
    required: ["Read analytics"],
    missing: connected
      ? []
      : [{ feature: "Analytics", reason: reasonFor("analytics", platformName), scopes: ["Read analytics"] }],
    publishingReady: false,
    analyticsReady: connected,
    healthy: connected,
    healthReason: connected ? undefined : "Not connected yet.",
  };
}

export const Route = createFileRoute("/_authenticated/settings/platforms")({
  head: () => ({
    meta: [
      { title: "Platforms — Rothme" },
      { name: "description", content: "All connected platforms in one place." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PlatformsPage,
});

function PlatformsPage() {
  const qc = useQueryClient();

  const listAccountsFn = useServerFn(listSocialAccounts);
  const listStatusFn = useServerFn(listPlatformStatuses);
  const listConnFn = useServerFn(listConnections);
  const startConnectFn = useServerFn(startConnect);
  const disconnectAcctFn = useServerFn(disconnectAccount);
  const refreshAcctFn = useServerFn(refreshAccount);
  const syncAcctFn = useServerFn(triggerSync);
  const connectProviderFn = useServerFn(connectProvider);
  const disconnectProviderFn = useServerFn(disconnectProvider);

  const accountsQ = useQuery({ queryKey: ["social-accounts"], queryFn: () => listAccountsFn() });
  const statusQ = useQuery({ queryKey: ["social-platform-status"], queryFn: () => listStatusFn() });
  const connsQ = useQuery({ queryKey: ["connections"], queryFn: () => listConnFn() });

  const [busy, setBusy] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "connected" | "needs_reauth" | "not_connected" | "coming_soon">("all");

  const statusMap = useMemo(() => {
    const m = new Map<string, boolean>();
    for (const s of statusQ.data ?? []) m.set(s.id, s.configured);
    return m;
  }, [statusQ.data]);

  const rows: Row[] = useMemo(() => {
    const list: Row[] = [];
    const accounts = accountsQ.data ?? [];
    const connections = connsQ.data ?? [];
    const providerConnMap = new Map(connections.map((c: any) => [c.provider, c.connected_at as string]));

    // 1. Social platforms (per-account rows; unconnected available platforms once)
    for (const p of SOCIAL_PLATFORMS) {
      const platformAccounts = accounts.filter((a) => a.platform === p.id);
      const isComingSoon = p.availability !== "available" || !statusMap.get(p.id);
      if (isComingSoon && platformAccounts.length === 0) {
        list.push({
          key: `social:${p.id}`,
          platformId: p.id,
          platformName: p.name,
          category: p.category,
          brandColor: p.brandColor,
          mark: p.mark,
          kind: "coming_soon",
          connectedAccount: null,
          status: "coming_soon",
          lastSync: null,
        });
        continue;
      }
      if (platformAccounts.length === 0) {
        list.push({
          key: `social:${p.id}`,
          platformId: p.id,
          platformName: p.name,
          category: p.category,
          brandColor: p.brandColor,
          mark: p.mark,
          kind: "social",
          connectedAccount: null,
          status: "not_connected",
          lastSync: null,
        });
      } else {
        for (const a of platformAccounts) {
          const s = (a.connection_status ?? "not_connected") as UnifiedStatus;
          const uStatus = ["connected", "syncing", "needs_reauth", "error"].includes(s) ? s : "connected";
          list.push({
            key: `social:${p.id}:${a.id}`,
            platformId: p.id,
            platformName: p.name,
            category: p.category,
            brandColor: p.brandColor,
            mark: p.mark,
            kind: "social",
            connectedAccount:
              a.display_name || a.username || a.platform_account_id || "Connected account",
            status: uStatus,
            lastSync: a.last_sync ?? a.connected_at ?? null,
            accountId: a.id,
            capabilities: deriveSocialCapabilities(
              p.name, p.scopes, (a as any).scopes, uStatus,
              (a as any).last_error, (a as any).token_expiration,
            ),
          });
        }
      }
    }

    // 2. Data providers (Google Ads, Meta Ads, GA4, Shopify, Mailchimp)
    for (const id of PROVIDERS) {
      const meta = PROVIDER_META[id];
      const at = providerConnMap.get(id);
      list.push({
        key: `prov:${id}`,
        platformId: id,
        platformName: meta.name,
        category: "data",
        brandColor: "#0F172A",
        mark: meta.name.slice(0, 2).toUpperCase(),
        kind: "provider",
        connectedAccount: at ? "Your account" : null,
        status: at ? "connected" : "not_connected",
        lastSync: at ?? null,
        providerId: id,
        capabilities: deriveProviderCapabilities(Boolean(at), meta.name),
      });
    }

    // 3. Extra registry entries (advertising, ecommerce, payments, email, crm)
    //    that aren't already represented — always Coming Soon.
    const covered = new Set<string>([
      ...SOCIAL_PLATFORMS.map((p) => p.id),
      ...PROVIDERS,
      "google_business_profile", // duplicate of social gbp
    ]);
    for (const i of INTEGRATIONS) {
      if (covered.has(i.id)) continue;
      list.push({
        key: `reg:${i.id}`,
        platformId: i.id,
        platformName: i.name,
        category: i.category,
        brandColor: i.brandColor ?? "#0F172A",
        mark: i.mark ?? i.name.slice(0, 2).toUpperCase(),
        kind: "coming_soon",
        connectedAccount: null,
        status: "coming_soon",
        lastSync: null,
      });
    }

    return list;
  }, [accountsQ.data, connsQ.data, statusMap]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (search && !r.platformName.toLowerCase().includes(search.toLowerCase())) return false;
      if (filter === "connected") return r.status === "connected" || r.status === "syncing";
      if (filter === "needs_reauth") return r.status === "needs_reauth" || r.status === "error";
      if (filter === "not_connected") return r.status === "not_connected";
      if (filter === "coming_soon") return r.status === "coming_soon";
      return true;
    });
  }, [rows, search, filter]);

  const counts = useMemo(() => {
    let connected = 0, reauth = 0, available = 0, coming = 0;
    for (const r of rows) {
      if (r.status === "connected" || r.status === "syncing") connected++;
      else if (r.status === "needs_reauth" || r.status === "error") reauth++;
      else if (r.status === "not_connected") available++;
      else if (r.status === "coming_soon") coming++;
    }
    return { connected, reauth, available, coming };
  }, [rows]);

  async function handleReconnect(row: Row) {
    setBusy(row.key);
    try {
      if (row.kind === "social") {
        const res = await startConnectFn({
          data: { platform: row.platformId as any, origin: window.location.origin },
        });
        if (!res.ok) {
          toast.error(res.message ?? "Cannot connect this platform yet.");
          return;
        }
        window.location.href = res.authorizeUrl;
      } else if (row.kind === "provider" && row.providerId) {
        await connectProviderFn({ data: { provider: row.providerId } });
        toast.success("Connected.");
        qc.invalidateQueries({ queryKey: ["connections"] });
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not connect.");
    } finally {
      setBusy(null);
    }
  }

  async function handleDisconnect(row: Row) {
    setBusy(row.key);
    try {
      if (row.kind === "social" && row.accountId) {
        await disconnectAcctFn({ data: { accountId: row.accountId } });
        qc.invalidateQueries({ queryKey: ["social-accounts"] });
      } else if (row.kind === "provider" && row.providerId) {
        await disconnectProviderFn({ data: { provider: row.providerId } });
        qc.invalidateQueries({ queryKey: ["connections"] });
      }
      toast.success("Disconnected.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not disconnect.");
    } finally {
      setBusy(null);
    }
  }

  async function handleRefresh(row: Row) {
    setBusy(row.key);
    try {
      if (row.kind === "social" && row.accountId) {
        const r = await refreshAcctFn({ data: { accountId: row.accountId } });
        if (r.ok) {
          await syncAcctFn({ data: { accountId: row.accountId, kind: "full" } });
          toast.success("Refreshed.");
        } else {
          toast.error(r.message ?? "Refresh failed. Try Reconnect.");
        }
        qc.invalidateQueries({ queryKey: ["social-accounts"] });
      } else if (row.kind === "provider" && row.providerId) {
        await connectProviderFn({ data: { provider: row.providerId } });
        qc.invalidateQueries({ queryKey: ["connections"] });
        toast.success("Refreshed.");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Refresh failed.");
    } finally {
      setBusy(null);
    }
  }

  const loading = accountsQ.isLoading || statusQ.isLoading || connsQ.isLoading;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <nav className="mb-8 flex flex-wrap gap-1 border-b border-border">
          <Link to="/settings/profile" className="border-b-2 border-transparent px-3 py-2 text-sm text-muted-foreground hover:text-foreground">Profile</Link>
          <Link to="/settings/connections" className="border-b-2 border-transparent px-3 py-2 text-sm text-muted-foreground hover:text-foreground">Integrations</Link>
          <Link to="/settings/social-accounts" className="border-b-2 border-transparent px-3 py-2 text-sm text-muted-foreground hover:text-foreground">Connected Accounts</Link>
          <Link to="/settings/platforms" className="border-b-2 border-foreground px-3 py-2 text-sm font-medium">Platforms</Link>
        </nav>

        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Platforms</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Every platform you've connected to Rothme — status, last sync, and one place to reconnect, disconnect, or refresh.
          </p>
        </header>

        <div className="mb-6 grid gap-3 sm:grid-cols-4">
          <SummaryStat label="Connected" value={counts.connected} icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />} />
          <SummaryStat label="Needs reauthorization" value={counts.reauth} icon={<AlertTriangle className="h-4 w-4 text-amber-500" />} />
          <SummaryStat label="Available to connect" value={counts.available} icon={<Sparkles className="h-4 w-4 text-muted-foreground" />} />
          <SummaryStat label="Coming soon" value={counts.coming} icon={<Clock className="h-4 w-4 text-muted-foreground" />} />
        </div>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search platforms…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <div className="flex flex-wrap gap-2">
            {([
              ["all", "All"],
              ["connected", "Connected"],
              ["needs_reauth", "Needs reauth"],
              ["not_connected", "Available"],
              ["coming_soon", "Coming soon"],
            ] as const).map(([key, label]) => (
              <button key={key} onClick={() => setFilter(key)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  filter === key
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-background text-muted-foreground hover:text-foreground"
                }`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl border border-border/60 bg-card/40" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card className="p-10 text-center text-muted-foreground">No platforms match your filters.</Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="hidden grid-cols-[1.4fr_1.2fr_0.9fr_1fr_1.3fr] items-center gap-4 border-b border-border bg-muted/30 px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground md:grid">
              <div>Platform</div>
              <div>Connected account</div>
              <div>Status</div>
              <div>Last sync</div>
              <div className="text-right">Actions</div>
            </div>
            <ul className="divide-y divide-border">
              {filtered.map((r) => (
                <PlatformRow
                  key={r.key}
                  row={r}
                  busy={busy === r.key}
                  onReconnect={() => handleReconnect(r)}
                  onDisconnect={() => handleDisconnect(r)}
                  onRefresh={() => handleRefresh(r)}
                />
              ))}
            </ul>
          </Card>
        )}
      </main>
      <Toaster theme="light" position="bottom-right" />
    </div>
  );
}

function SummaryStat({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <Card className="flex items-center gap-3 p-4">
      <div className="grid h-9 w-9 place-items-center rounded-lg bg-muted">{icon}</div>
      <div>
        <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className="text-xl font-semibold">{value}</div>
      </div>
    </Card>
  );
}

function StatusBadge({ status }: { status: UnifiedStatus }) {
  const map: Record<UnifiedStatus, { label: string; className: string }> = {
    connected: { label: "Connected", className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30" },
    syncing: { label: "Syncing", className: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30" },
    needs_reauth: { label: "Needs reauth", className: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30" },
    error: { label: "Error", className: "bg-destructive/10 text-destructive border-destructive/30" },
    not_connected: { label: "Not connected", className: "bg-muted text-muted-foreground border-border" },
    coming_soon: { label: "Coming soon", className: "bg-muted text-muted-foreground border-border" },
  };
  const s = map[status];
  return <Badge variant="outline" className={s.className}>{s.label}</Badge>;
}

function formatWhen(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "Just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  return d.toLocaleDateString();
}

function CapChip({
  ok, label, muted,
}: { ok: boolean | null; label: string; muted?: boolean }) {
  const cls = muted
    ? "border-border bg-muted text-muted-foreground"
    : ok
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
      : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300";
  const Icon = muted ? Clock : ok ? CheckCircle2 : AlertTriangle;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${cls}`}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

function PlatformRow({
  row, busy, onReconnect, onDisconnect, onRefresh,
}: {
  row: Row;
  busy: boolean;
  onReconnect: () => void;
  onDisconnect: () => void;
  onRefresh: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [grantOpen, setGrantOpen] = useState<null | MissingGroup>(null);
  const c = row.capabilities;
  const isConnected = row.status === "connected" || row.status === "syncing" || row.status === "needs_reauth" || row.status === "error";

  return (
    <li className="px-5 py-4">
      <div className="grid grid-cols-1 items-center gap-3 md:grid-cols-[1.4fr_1.2fr_0.9fr_1fr_1.3fr] md:gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="grid h-9 w-9 place-items-center rounded-lg text-xs font-semibold text-white" style={{ backgroundColor: row.brandColor }}>
            {row.mark}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">{row.platformName}</div>
            <div className="truncate text-xs capitalize text-muted-foreground">{row.category}</div>
          </div>
        </div>
        <div className="min-w-0 truncate text-sm text-muted-foreground">
          {row.connectedAccount ?? <span className="italic">—</span>}
        </div>
        <div><StatusBadge status={row.status} /></div>
        <div className="text-sm text-muted-foreground">{formatWhen(row.lastSync)}</div>
        <div className="flex flex-wrap items-center justify-start gap-2 md:justify-end">
          {row.status === "coming_soon" ? (
            <span className="text-xs text-muted-foreground">Not yet available</span>
          ) : row.status === "not_connected" ? (
            <Button size="sm" variant="outline" disabled={busy} onClick={onReconnect}>
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Link2 className="h-3.5 w-3.5" />}
              <span className="ml-1.5">Connect</span>
            </Button>
          ) : (
            <>
              <Button size="sm" variant="outline" disabled={busy} onClick={onRefresh} title="Refresh">
                {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                <span className="ml-1.5 hidden sm:inline">Refresh</span>
              </Button>
              <Button size="sm" variant="outline" disabled={busy} onClick={onReconnect} title="Reconnect">
                <Link2 className="h-3.5 w-3.5" />
                <span className="ml-1.5 hidden sm:inline">Reconnect</span>
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="outline" disabled={busy} title="Disconnect">
                    <Link2Off className="h-3.5 w-3.5" />
                    <span className="ml-1.5 hidden sm:inline">Disconnect</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Disconnect {row.platformName}?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Rothme will stop pulling data from this account. You can reconnect any time.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onDisconnect}>Disconnect</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </div>

      {isConnected && c && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <CapChip ok={c.granted.length > 0} label={`Permissions granted · ${c.granted.length}`} />
          <CapChip
            ok={c.missing.length === 0}
            label={c.missing.length === 0
              ? `All permissions granted`
              : `Additional permissions · ${c.missing.reduce((n, g) => n + g.scopes.length, 0)}`}
          />
          <CapChip ok={c.publishingReady} label={c.publishingReady ? "Publishing ready" : "Publishing limited"} />
          <CapChip ok={c.analyticsReady} label={c.analyticsReady ? "Analytics ready" : "Analytics limited"} />
          <CapChip ok={c.healthy} label={c.healthy ? "Connection healthy" : "Attention needed"} />
          <button
            onClick={() => setOpen((v) => !v)}
            className="ml-auto inline-flex items-center gap-1 rounded-full border border-border bg-background px-2 py-0.5 text-[11px] font-medium text-muted-foreground hover:text-foreground"
          >
            {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            Details
          </button>
        </div>
      )}

      {isConnected && c && open && (
        <div className="mt-3 rounded-xl border border-border bg-muted/20 p-4 text-sm">
          {!c.healthy && c.healthReason && (
            <div className="mb-3 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-amber-800 dark:text-amber-200">
              <AlertTriangle className="mt-0.5 h-4 w-4" />
              <div>{c.healthReason}</div>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Permissions granted</div>
              {c.granted.length === 0 ? (
                <div className="text-muted-foreground italic">None yet.</div>
              ) : (
                <ul className="space-y-1">
                  {c.granted.map((s) => (
                    <li key={s} className="flex items-start gap-2 text-xs">
                      <ShieldCheck className="mt-0.5 h-3.5 w-3.5 text-emerald-500" />
                      <code className="break-all text-muted-foreground">{s}</code>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <div className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Permissions required</div>
              {c.required.length === 0 ? (
                <div className="text-muted-foreground italic">No additional permissions needed.</div>
              ) : (
                <ul className="space-y-1">
                  {c.required.map((s) => (
                    <li key={s} className="flex items-start gap-2 text-xs">
                      {c.granted.includes(s)
                        ? <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-emerald-500" />
                        : <XCircle className="mt-0.5 h-3.5 w-3.5 text-amber-500" />}
                      <code className="break-all text-muted-foreground">{s}</code>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {c.missing.length > 0 && (
            <div className="mt-4 space-y-3">
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Additional permissions for future features
              </div>
              {c.missing.map((g) => (
                <div key={g.feature} className="flex flex-col gap-2 rounded-lg border border-border bg-background p-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-medium">{g.feature}</div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{g.reason}</p>
                    <div className="mt-1 text-[11px] text-muted-foreground">
                      Requests: <code className="break-all">{g.scopes.join(", ")}</code>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => setGrantOpen(g)}>
                    Grant additional access
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <AlertDialog open={grantOpen !== null} onOpenChange={(v) => !v && setGrantOpen(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Enable {grantOpen?.feature} on {row.platformName}?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm">
                <p>{grantOpen?.reason}</p>
                <p className="text-xs text-muted-foreground">
                  We'll reopen {row.platformName}'s permission screen. You can review every scope before approving,
                  and revoke access from {row.platformName} at any time.
                </p>
                {grantOpen && (
                  <div className="rounded-md border border-border bg-muted/40 p-2 text-[11px] text-muted-foreground">
                    <div className="font-medium text-foreground">Permissions we'll request:</div>
                    <code className="break-all">{grantOpen.scopes.join(", ")}</code>
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Not now</AlertDialogCancel>
            <AlertDialogAction onClick={() => { setGrantOpen(null); onReconnect(); }}>
              Continue to {row.platformName}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </li>
  );
}
