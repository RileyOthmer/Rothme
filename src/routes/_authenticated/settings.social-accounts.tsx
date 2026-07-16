import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast, Toaster } from "sonner";
import {
  CheckCircle2, AlertTriangle, RefreshCw, Link2, Link2Off, Search,
  Loader2, ExternalLink, Sparkles, XCircle,
} from "lucide-react";

import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PLATFORMS, type PlatformConfig } from "@/lib/social-connections/platforms";
import {
  listSocialAccounts,
  listPlatformStatuses,
  startConnect,
  disconnectAccount,
  refreshAccount,
  triggerSync,
} from "@/lib/social-connections/social-connections.functions";

type FilterKind = "all" | "connected" | "not_connected" | "needs_reauth";

export const Route = createFileRoute("/_authenticated/settings/social-accounts")({
  head: () => ({
    meta: [
      { title: "Connected Accounts — Rothme" },
      { name: "description", content: "Connect your social media accounts to unlock analytics, publishing, AI, and reporting." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SocialAccountsPage,
});

type Account = Awaited<ReturnType<typeof listSocialAccounts>>[number];

function SocialAccountsPage() {
  const qc = useQueryClient();
  const listFn = useServerFn(listSocialAccounts);
  const statusFn = useServerFn(listPlatformStatuses);

  const accountsQ = useQuery({ queryKey: ["social-accounts"], queryFn: () => listFn() });
  const statusQ = useQuery({ queryKey: ["social-platform-status"], queryFn: () => statusFn() });

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterKind>("all");
  const [banner, setBanner] = useState<{ kind: "success" | "error"; message: string } | null>(() => {
    if (typeof window === "undefined") return null;
    const p = new URLSearchParams(window.location.search);
    const status = p.get("status");
    if (!status) return null;
    if (status === "success") {
      return { kind: "success", message: `${p.get("platform") ?? "Account"} connected successfully.` };
    }
    return {
      kind: "error",
      message:
        p.get("message") ??
        (p.get("reason") ? `Connection failed: ${p.get("reason")}` : "Connection failed."),
    };
  });

  const accountsByPlatform = useMemo(() => {
    const map = new Map<string, Account[]>();
    for (const a of accountsQ.data ?? []) {
      const arr = map.get(a.platform) ?? [];
      arr.push(a);
      map.set(a.platform, arr);
    }
    return map;
  }, [accountsQ.data]);

  const statusMap = useMemo(() => {
    const m = new Map<string, boolean>();
    for (const s of statusQ.data ?? []) m.set(s.id, s.configured);
    return m;
  }, [statusQ.data]);

  const filtered = useMemo(() => {
    return PLATFORMS.filter((p) => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      const accts = accountsByPlatform.get(p.id) ?? [];
      const hasConnected = accts.some((a) => a.connection_status === "connected" || a.connection_status === "syncing");
      const hasReauth = accts.some((a) => a.connection_status === "needs_reauth" || a.connection_status === "error");
      if (filter === "connected") return hasConnected;
      if (filter === "needs_reauth") return hasReauth;
      if (filter === "not_connected") return accts.length === 0;
      return true;
    });
  }, [search, filter, accountsByPlatform]);

  const counts = useMemo(() => {
    let connected = 0, reauth = 0;
    for (const a of accountsQ.data ?? []) {
      if (a.connection_status === "connected" || a.connection_status === "syncing") connected++;
      if (a.connection_status === "needs_reauth" || a.connection_status === "error") reauth++;
    }
    return { connected, reauth, notConnected: PLATFORMS.length - accountsByPlatform.size };
  }, [accountsQ.data, accountsByPlatform.size]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <nav className="mb-8 flex flex-wrap gap-1 border-b border-border">
          <Link to="/settings/profile" className="border-b-2 border-transparent px-3 py-2 text-sm text-muted-foreground hover:text-foreground">Profile</Link>
          <Link to="/settings/connections" className="border-b-2 border-transparent px-3 py-2 text-sm text-muted-foreground hover:text-foreground">Integrations</Link>
          <Link to="/settings/social-accounts" className="border-b-2 border-foreground px-3 py-2 text-sm font-medium">Connected Accounts</Link>
          <Link to="/settings/notifications" className="border-b-2 border-transparent px-3 py-2 text-sm text-muted-foreground hover:text-foreground">Notifications</Link>
        </nav>

        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Connected Accounts</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Connect your social media accounts to unlock analytics, publishing, AI, and reporting.
          </p>
        </header>

        {banner && (
          <div
            className={`mb-6 flex items-start gap-3 rounded-2xl border p-4 text-sm ${
              banner.kind === "success"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100"
                : "border-destructive/30 bg-destructive/10 text-destructive"
            }`}
          >
            {banner.kind === "success" ? <CheckCircle2 className="mt-0.5 h-4 w-4" /> : <XCircle className="mt-0.5 h-4 w-4" />}
            <div className="flex-1">{banner.message}</div>
            <button className="opacity-60 hover:opacity-100" onClick={() => setBanner(null)}>Dismiss</button>
          </div>
        )}

        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <SummaryStat label="Connected" value={counts.connected} icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />} />
          <SummaryStat label="Needs reauthorization" value={counts.reauth} icon={<AlertTriangle className="h-4 w-4 text-amber-500" />} />
          <SummaryStat label="Available to connect" value={counts.notConnected} icon={<Sparkles className="h-4 w-4 text-muted-foreground" />} />
        </div>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search platforms…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["all", "All"],
                ["connected", "Connected"],
                ["not_connected", "Not connected"],
                ["needs_reauth", "Needs reauthorization"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  filter === key
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {accountsQ.isLoading || statusQ.isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-40 animate-pulse rounded-2xl border border-border/60 bg-card/40" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card className="p-10 text-center">
            <p className="text-muted-foreground">No platforms match your filters.</p>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map((p) => (
              <PlatformCard
                key={p.id}
                platform={p}
                configured={statusMap.get(p.id) ?? false}
                accounts={accountsByPlatform.get(p.id) ?? []}
                onChanged={() => {
                  qc.invalidateQueries({ queryKey: ["social-accounts"] });
                }}
              />
            ))}
          </div>
        )}
      </main>
      <Toaster theme="light" position="bottom-right" />
    </div>
  );
}

function SummaryStat({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <Card className="flex items-center justify-between p-4">
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-semibold">{value}</p>
      </div>
      <div className="grid h-9 w-9 place-items-center rounded-full bg-muted">{icon}</div>
    </Card>
  );
}

function PlatformCard({
  platform,
  configured,
  accounts,
  onChanged,
}: {
  platform: PlatformConfig;
  configured: boolean;
  accounts: Account[];
  onChanged: () => void;
}) {
  const startFn = useServerFn(startConnect);
  const disconnectFn = useServerFn(disconnectAccount);
  const refreshFn = useServerFn(refreshAccount);
  const syncFn = useServerFn(triggerSync);
  const [busy, setBusy] = useState<string | null>(null);

  const primary = accounts[0];
  const status = primary?.connection_status;

  async function onConnect() {
    setBusy("connect");
    try {
      const res = await startFn({ data: { platform: platform.id, origin: window.location.origin } });
      if (!res.ok) {
        toast.message(`${platform.name} — awaiting credentials`, {
          description: res.message,
          action: {
            label: "Docs",
            onClick: () => window.open(res.docsUrl, "_blank", "noopener,noreferrer"),
          },
        });
        return;
      }
      window.location.href = res.authorizeUrl;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to start connection");
    } finally {
      setBusy(null);
    }
  }

  async function onDisconnect(accountId: string) {
    setBusy(`disc:${accountId}`);
    try {
      await disconnectFn({ data: { accountId } });
      toast.success(`${platform.name} disconnected`);
      onChanged();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Disconnect failed");
    } finally {
      setBusy(null);
    }
  }

  async function onRefresh(accountId: string) {
    setBusy(`refresh:${accountId}`);
    try {
      const r = await refreshFn({ data: { accountId } });
      if (!r.ok) toast.error(r.message ?? "Refresh failed");
      else toast.success(`${platform.name} token refreshed`);
      onChanged();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Refresh failed");
    } finally {
      setBusy(null);
    }
  }

  async function onSync(accountId: string) {
    setBusy(`sync:${accountId}`);
    try {
      const r = await syncFn({ data: { accountId, kind: "full" } });
      if (!r.ok) toast.error(r.error ?? "Sync failed");
      else toast.success(`${platform.name} synced`);
      onChanged();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Sync failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex items-start gap-3">
        <div
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-sm font-semibold text-white"
          style={{ background: platform.brandColor }}
          aria-hidden
        >
          {platform.mark}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-semibold">{platform.name}</p>
            <StatusPill status={status} configured={configured} />
          </div>
          <p className="truncate text-xs text-muted-foreground">{platform.blurb}</p>
        </div>
      </div>

      {primary ? (
        <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 p-3">
          {primary.avatar_url ? (
            <img
              src={primary.avatar_url}
              alt=""
              className="h-9 w-9 rounded-full object-cover"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
            />
          ) : (
            <div className="grid h-9 w-9 place-items-center rounded-full bg-background text-[11px] font-semibold text-muted-foreground">
              {(primary.display_name ?? primary.username ?? platform.mark).slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{primary.display_name ?? primary.username ?? "Connected account"}</p>
            <p className="truncate text-xs text-muted-foreground">
              {primary.username ? `@${primary.username.replace(/^@/, "")} · ` : ""}
              Last sync: {primary.last_sync ? new Date(primary.last_sync).toLocaleString() : "never"}
            </p>
            {primary.last_error && (
              <p className="mt-1 truncate text-xs text-destructive">{primary.last_error}</p>
            )}
          </div>
        </div>
      ) : configured ? (
        <div className="rounded-xl border border-dashed border-border/60 p-3 text-xs text-muted-foreground">
          Not connected yet.
        </div>
      ) : (
        <div className="flex items-start gap-2 rounded-xl border border-dashed border-border/60 bg-muted/20 p-3 text-xs text-muted-foreground">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
          <div>
            Awaiting developer credentials. Add <code className="rounded bg-muted px-1">{platform.clientIdEnv}</code> and{" "}
            <code className="rounded bg-muted px-1">{platform.clientSecretEnv}</code> to enable this connection.
            <a
              href={platform.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 inline-flex items-center gap-0.5 underline underline-offset-2"
            >
              Docs <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {!primary ? (
          <Button size="sm" onClick={onConnect} disabled={!!busy}>
            {busy === "connect" ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Link2 className="mr-1.5 h-3.5 w-3.5" />}
            Connect
          </Button>
        ) : (
          <>
            <Button size="sm" variant="outline" onClick={() => onSync(primary.id)} disabled={!!busy}>
              {busy === `sync:${primary.id}` ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="mr-1.5 h-3.5 w-3.5" />}
              Refresh
            </Button>
            {(status === "needs_reauth" || status === "error") && (
              <Button size="sm" onClick={onConnect} disabled={!!busy}>
                {busy === "connect" ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Link2 className="mr-1.5 h-3.5 w-3.5" />}
                Reconnect
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={() => onRefresh(primary.id)} disabled={!!busy}>
              Refresh token
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-destructive hover:text-destructive"
              onClick={() => onDisconnect(primary.id)}
              disabled={!!busy}
            >
              <Link2Off className="mr-1.5 h-3.5 w-3.5" />
              Disconnect
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}

function StatusPill({ status, configured }: { status?: string; configured: boolean }) {
  if (!configured) {
    return <Badge variant="outline" className="rounded-full text-[10px]">Awaiting credentials</Badge>;
  }
  if (!status) {
    return <Badge variant="outline" className="rounded-full text-[10px] text-muted-foreground">Not connected</Badge>;
  }
  const map: Record<string, { label: string; className: string }> = {
    connected: { label: "Connected", className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30" },
    syncing: { label: "Syncing", className: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30" },
    needs_reauth: { label: "Needs reauth", className: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30" },
    error: { label: "Error", className: "bg-destructive/15 text-destructive border-destructive/30" },
    disconnected: { label: "Disconnected", className: "text-muted-foreground" },
  };
  const meta = map[status] ?? { label: status, className: "" };
  return <Badge variant="outline" className={`rounded-full text-[10px] ${meta.className}`}>{meta.label}</Badge>;
}
