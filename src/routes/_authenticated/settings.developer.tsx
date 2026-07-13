import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Lock, ShieldCheck } from "lucide-react";

import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  claimFirstAdmin, isAdmin, listIntegrations,
} from "@/lib/integrations/integrations.functions";
import { PlatformPanel } from "@/features/dev-integrations/PlatformPanel";

export const Route = createFileRoute("/_authenticated/settings/developer")({
  head: () => ({
    meta: [
      { title: "Developer Integrations — Velora" },
      {
        name: "description",
        content:
          "Admin-only control room for every social platform integration: credentials, endpoints, KPI mapping, connection tests, and developer logs.",
      },
    ],
  }),
  component: DeveloperPage,
});

function DeveloperPage() {
  const isAdminFn = useServerFn(isAdmin);
  const claimFn   = useServerFn(claimFirstAdmin);
  const listFn    = useServerFn(listIntegrations);

  const adminQuery = useQuery({
    queryKey: ["is-admin"],
    queryFn: () => isAdminFn(),
    staleTime: 60_000,
  });

  const integrationsQuery = useQuery({
    queryKey: ["integrations"],
    queryFn: () => listFn(),
    enabled: adminQuery.data?.isAdmin === true,
  });

  const [claiming, setClaiming] = useState(false);
  const [activePlatform, setActivePlatform] = useState<string | null>(null);

  if (adminQuery.isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <AppHeader />
        <main className="mx-auto max-w-5xl px-4 py-14 text-sm text-muted-foreground">Loading…</main>
      </div>
    );
  }

  if (!adminQuery.data?.isAdmin) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <AppHeader />
        <main className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-muted">
            <Lock className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Developer Integrations</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              This area is restricted to workspace administrators. If you're the first person setting up Velora, you can claim admin now.
            </p>
          </div>
          <Button
            onClick={async () => {
              setClaiming(true);
              try {
                const { claimed } = await claimFn();
                if (claimed) adminQuery.refetch();
                else adminQuery.refetch();
              } finally { setClaiming(false); }
            }}
            disabled={claiming}
          >
            <ShieldCheck className="mr-2 h-4 w-4" />
            {claiming ? "Checking…" : "Claim admin access"}
          </Button>
          <p className="text-[11px] text-muted-foreground">
            Only works when no admin exists yet. After that, ask an existing admin to grant you access.
          </p>
        </main>
      </div>
    );
  }

  const rows = integrationsQuery.data ?? [];
  const active = activePlatform
    ? rows.find((r) => r.platform === activePlatform)
    : rows[0];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Admin · Developer</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Developer Integrations</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Configure every platform integration by hand. Nothing is hardcoded — each provider's credentials, endpoints, and KPI mapping live here, encrypted and audit-logged.
            </p>
          </div>
          <Badge variant="outline" className="rounded-full">
            <ShieldCheck className="mr-1 h-3 w-3" /> Admin
          </Badge>
        </header>

        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          {/* Platform sidebar */}
          <aside className="rounded-2xl border border-border/60 bg-card/40 p-2">
            <ul className="space-y-0.5">
              {rows.map((r) => {
                const selected = (active?.platform ?? "") === r.platform;
                return (
                  <li key={r.platform}>
                    <button
                      type="button"
                      onClick={() => setActivePlatform(r.platform)}
                      className={
                        "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition " +
                        (selected ? "bg-primary/10 text-foreground" : "hover:bg-muted/60 text-muted-foreground")
                      }
                    >
                      <span className="truncate">{r.display_name}</span>
                      <span className={
                        "h-1.5 w-1.5 shrink-0 rounded-full " +
                        (r.status === "verified" ? "bg-emerald-500"
                         : r.status === "tested" ? "bg-blue-500"
                         : r.status === "error"  ? "bg-red-500"
                         : "bg-muted-foreground/40")
                      } />
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>

          {/* Panel */}
          <section className="rounded-2xl border border-border/60 bg-card/40 p-6">
            {active ? <PlatformPanel key={active.platform} row={active} /> : null}
          </section>
        </div>
      </main>
    </div>
  );
}
