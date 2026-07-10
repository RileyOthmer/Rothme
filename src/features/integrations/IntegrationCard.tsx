import { useState } from "react";
import { RefreshCw, Unplug, Bell, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { PlatformLogo } from "./PlatformLogo";
import { StatusPill } from "./StatusPill";
import { relativeTime, isStale } from "./relative-time";
import type { ConnectionState, IntegrationDefinition } from "./types";

type Props = {
  integration: IntegrationDefinition;
  connection: ConnectionState;
  busy?: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onRefresh: () => void;
  onNotify?: () => void;
};

export function IntegrationCard({
  integration, connection, busy, onConnect, onDisconnect, onRefresh, onNotify,
}: Props) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const isConnected = connection.status === "connected" || connection.status === "syncing";
  const stale = connection.status === "connected" && isStale(connection.lastSyncedAt);

  return (
    <div className="group flex flex-col rounded-2xl border border-border bg-surface p-5 shadow-xs transition-shadow hover:shadow-sm">
      <div className="flex items-start gap-3">
        <PlatformLogo integration={integration} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-foreground">{integration.name}</h3>
          </div>
          <div className="mt-1">
            <StatusPill status={connection.status} />
          </div>
        </div>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {integration.summary}
      </p>

      <div className="mt-4 space-y-1 text-xs text-muted-foreground">
        {isConnected ? (
          <div className={stale ? "text-amber-700 dark:text-amber-300" : undefined}>
            Last updated {relativeTime(connection.lastSyncedAt ?? connection.connectedAt)}
          </div>
        ) : integration.available ? (
          <div>Takes about 30 seconds to connect.</div>
        ) : (
          <div>Coming soon — we'll tell you the moment it's ready.</div>
        )}
        {connection.status === "error" && connection.errorMessage ? (
          <div className="text-amber-700 dark:text-amber-300">{connection.errorMessage}</div>
        ) : null}
      </div>

      <div className="mt-5 flex items-center justify-between gap-2">
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogTrigger asChild>
            <button
              type="button"
              className="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              What Velora reads
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <PlatformLogo integration={integration} size={28} />
                {integration.name} permissions
              </DialogTitle>
              <DialogDescription>
                We only read what we need to explain your marketing. We never post, never change
                settings, and never share your data.
              </DialogDescription>
            </DialogHeader>
            <ul className="mt-2 space-y-2 text-sm">
              {integration.permissions.map((p) => (
                <li key={p} className="flex items-start gap-2">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDetailsOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="flex items-center gap-2">
          {isConnected ? (
            <>
              <Button
                variant="ghost" size="sm" onClick={onRefresh} disabled={busy}
                aria-label={`Refresh ${integration.name}`}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Refresh
              </Button>
              <Button
                variant="outline" size="sm" onClick={onDisconnect} disabled={busy}
              >
                <Unplug className="h-3.5 w-3.5" />
                Disconnect
              </Button>
            </>
          ) : integration.available ? (
            <Button size="sm" onClick={onConnect} disabled={busy}>Connect</Button>
          ) : (
            <Button variant="outline" size="sm" onClick={onNotify}>
              <Bell className="h-3.5 w-3.5" />
              Notify me
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
