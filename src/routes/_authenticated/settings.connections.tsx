import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { Toaster, toast } from "sonner";

import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import {
  connectProvider,
  disconnectProvider,
  listConnections,
  PROVIDERS,
  PROVIDER_META,
  type Provider,
} from "@/lib/connections.functions";

export const Route = createFileRoute("/_authenticated/settings/connections")({
  head: () => ({
    meta: [
      { title: "Connections — Velora" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ConnectionsSettings,
});

function ConnectionsSettings() {
  const qc = useQueryClient();
  const fetchConnections = useServerFn(listConnections);
  const connectFn = useServerFn(connectProvider);
  const disconnectFn = useServerFn(disconnectProvider);

  const connections = useQuery({
    queryKey: ["connections"],
    queryFn: () => fetchConnections(),
  });

  const connectMutation = useMutation({
    mutationFn: (provider: Provider) => connectFn({ data: { provider } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["connections"] }),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not connect."),
  });
  const disconnectMutation = useMutation({
    mutationFn: (provider: Provider) => disconnectFn({ data: { provider } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["connections"] }),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not disconnect."),
  });

  const connected = new Map((connections.data ?? []).map((c) => [c.provider, c.connected_at]));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage which marketing tools power your dashboard.
          </p>
        </div>

        <nav className="mb-6 flex gap-1 border-b border-border">
          <Link
            to="/settings/profile"
            className="border-b-2 border-transparent px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
          >
            Profile
          </Link>
          <Link
            to="/settings/connections"
            className="border-b-2 border-foreground px-3 py-2 text-sm font-medium"
          >
            Connections
          </Link>
        </nav>

        <div className="mb-4 rounded-md bg-surface-2 px-3 py-2 text-xs text-muted-foreground">
          Demo connections for now — real account linking is coming soon.
        </div>

        <ul className="space-y-2">
          {PROVIDERS.map((p) => {
            const meta = PROVIDER_META[p];
            const at = connected.get(p);
            return (
              <li
                key={p}
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface p-4"
              >
                <div>
                  <div className="text-sm font-medium">{meta.name}</div>
                  <div className="text-xs text-muted-foreground">{meta.blurb}</div>
                  {at ? (
                    <div className="mt-1 text-[11px] text-muted-foreground">
                      Connected {new Date(at as string).toLocaleDateString()}
                    </div>
                  ) : null}
                </div>
                {at ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => disconnectMutation.mutate(p)}
                    disabled={disconnectMutation.isPending}
                  >
                    <Check className="h-3.5 w-3.5" /> Disconnect
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => connectMutation.mutate(p)}
                    disabled={connectMutation.isPending}
                  >
                    Connect
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      </main>
      <Toaster theme="light" position="bottom-right" />
    </div>
  );
}
