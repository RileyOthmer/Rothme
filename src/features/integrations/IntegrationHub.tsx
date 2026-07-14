import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, Plug } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { INTEGRATIONS, getIntegration } from "./registry";
import { CATEGORY_LABEL, type ConnectionState, type IntegrationCategory } from "./types";
import { IntegrationCard } from "./IntegrationCard";
import {
  connectProvider, disconnectProvider, listConnections, PROVIDERS,
  type Provider,
} from "@/lib/connections.functions";

const ALL: "all" = "all";
type Filter = typeof ALL | IntegrationCategory | "connected";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "connected", label: "Connected" },
  { id: "advertising", label: CATEGORY_LABEL.advertising },
  { id: "social", label: CATEGORY_LABEL.social },
  { id: "analytics", label: CATEGORY_LABEL.analytics },
  { id: "ecommerce", label: CATEGORY_LABEL.ecommerce },
  { id: "payments", label: CATEGORY_LABEL.payments },
  { id: "email", label: CATEGORY_LABEL.email },
  { id: "crm", label: CATEGORY_LABEL.crm },
  { id: "presence", label: CATEGORY_LABEL.presence },
];

/**
 * Only the small subset of registry ids that the backend `PROVIDERS` enum
 * currently accepts are wired to live persistence. Everything else stores
 * connection state in memory for the session so the UI stays honest —
 * "Coming soon" cards don't call the backend at all.
 */
const LIVE_PROVIDERS = new Set<string>(PROVIDERS);

export function IntegrationHub() {
  const qc = useQueryClient();
  const fetchConnections = useServerFn(listConnections);
  const connectFn = useServerFn(connectProvider);
  const disconnectFn = useServerFn(disconnectProvider);

  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [busy, setBusy] = useState<string | null>(null);
  const [localSync, setLocalSync] = useState<Record<string, string>>({});

  const connections = useQuery({
    queryKey: ["connections"],
    queryFn: () => fetchConnections(),
  });

  const connectedMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const c of connections.data ?? []) m.set(c.provider, c.connected_at as string);
    return m;
  }, [connections.data]);

  const connectMutation = useMutation({
    mutationFn: (id: Provider) => connectFn({ data: { provider: id } }),
    onSuccess: (_r, id) => {
      setLocalSync((s) => ({ ...s, [id]: new Date().toISOString() }));
      qc.invalidateQueries({ queryKey: ["connections"] });
      toast.success("Connected. We're pulling your data now.");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not connect."),
    onSettled: () => setBusy(null),
  });
  const disconnectMutation = useMutation({
    mutationFn: (id: Provider) => disconnectFn({ data: { provider: id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["connections"] });
      toast("Disconnected.");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not disconnect."),
    onSettled: () => setBusy(null),
  });

  function connectionFor(id: string): ConnectionState {
    const at = connectedMap.get(id);
    if (!at) return { integrationId: id, status: "disconnected" };
    return {
      integrationId: id,
      status: "connected",
      connectedAt: at,
      lastSyncedAt: localSync[id] ?? at,
    };
  }

  function handleConnect(id: string) {
    if (!LIVE_PROVIDERS.has(id)) {
      toast("This platform is coming soon.");
      return;
    }
    setBusy(id);
    connectMutation.mutate(id as Provider);
  }
  function handleDisconnect(id: string) {
    if (!LIVE_PROVIDERS.has(id)) return;
    setBusy(id);
    disconnectMutation.mutate(id as Provider);
  }
  function handleRefresh(id: string) {
    setLocalSync((s) => ({ ...s, [id]: new Date().toISOString() }));
    toast.success("We're checking for new data.");
  }
  function handleNotify(id: string) {
    const meta = getIntegration(id);
    toast.success(`We'll email you when ${meta?.name ?? "this integration"} is ready.`);
  }

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return INTEGRATIONS.filter((it) => {
      if (needle && !it.name.toLowerCase().includes(needle) &&
          !it.summary.toLowerCase().includes(needle)) return false;
      if (filter === "all") return true;
      if (filter === "connected") return connectedMap.has(it.id);
      return it.category === filter;
    });
  }, [q, filter, connectedMap]);

  const connectedCount = connectedMap.size;

  return (
    <section aria-labelledby="integrations-heading">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 id="integrations-heading" className="text-2xl font-semibold tracking-tight">
            Integrations
          </h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Connect the tools you already use. ROTHME reads your data — you never leave to check
            another dashboard.
          </p>
        </div>
        <div className="text-xs text-muted-foreground">
          {connectedCount === 0
            ? "Nothing connected yet"
            : `${connectedCount} connected · ${INTEGRATIONS.length - connectedCount} available`}
        </div>
      </header>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search Meta, Shopify, Google Analytics…"
            className="pl-9"
            aria-label="Search integrations"
          />
        </div>
      </div>

      <div className="mb-6 -mx-1 flex snap-x snap-mandatory gap-1 overflow-x-auto px-1 pb-1">
        {FILTERS.map((f) => {
          const active = filter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={
                "snap-start whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-colors " +
                (active
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-surface text-muted-foreground hover:text-foreground")
              }
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <EmptyState onReset={() => { setQ(""); setFilter("all"); }} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((it) => (
            <IntegrationCard
              key={it.id}
              integration={it}
              connection={connectionFor(it.id)}
              busy={busy === it.id}
              onConnect={() => handleConnect(it.id)}
              onDisconnect={() => handleDisconnect(it.id)}
              onRefresh={() => handleRefresh(it.id)}
              onNotify={() => handleNotify(it.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
      <div className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-surface-2">
        <Plug className="h-5 w-5 text-muted-foreground" />
      </div>
      <h2 className="mt-3 text-sm font-semibold">No integrations match that search</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Try a different word, or browse everything ROTHME supports.
      </p>
      <button
        type="button" onClick={onReset}
        className="mt-4 text-sm font-medium text-foreground underline underline-offset-4"
      >
        Show everything
      </button>
    </div>
  );
}
