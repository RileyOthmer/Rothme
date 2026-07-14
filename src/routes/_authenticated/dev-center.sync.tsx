import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";

import { DevCenterShell, EmptyPanel } from "@/features/dev-center/DevCenterShell";
import { Button } from "@/components/ui/button";
import { useActiveOrg } from "@/features/collab/useActiveOrg";
import { listSocialConnections, pingSocialConnection } from "@/lib/social/social.functions";
import { findPlatform } from "@/lib/dev-center/social-platforms";

export const Route = createFileRoute("/_authenticated/dev-center/sync")({
  component: SyncPage,
});

function SyncPage() {
  const org = useActiveOrg();
  const qc = useQueryClient();
  const listFn = useServerFn(listSocialConnections);
  const pingFn = useServerFn(pingSocialConnection);
  const q = useQuery({
    queryKey: ["dev-center", "connections", org.data?.id],
    queryFn: () => listFn({ data: { orgId: org.data!.id } }),
    enabled: !!org.data?.id,
  });
  const rows = (q.data ?? []) as Array<{
    id: string; platform: string; last_synced_at: string | null; status: string | null;
  }>;

  async function syncOne(id: string, name: string) {
    await toast.promise(pingFn({ data: { connectionId: id } }).then((r) => {
      if (!r.ok) throw new Error(r.error ?? "Sync failed");
      return r;
    }), { loading: `Syncing ${name}…`, success: `${name} synced`, error: (e) => (e as Error).message });
    qc.invalidateQueries({ queryKey: ["dev-center", "connections"] });
  }

  return (
    <DevCenterShell
      title="Sync Manager"
      description="Manual, scheduled, and automatic synchronization. Failed jobs are retried with backoff. A background sweep runs every 15 minutes."
    >
      <div className="mb-6 rounded-2xl border border-border/60 bg-card/40 p-4 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">Scheduled sweep:</span> every 15 minutes via pg_cron → <code className="text-xs">/api/public/cron/social-sync</code>
      </div>

      {rows.length === 0 ? (
        <EmptyPanel title="No sync jobs" body="Connect a platform to enable analytics synchronization." />
      ) : (
        <ul className="space-y-2">
          {rows.map((r) => {
            const p = findPlatform(r.platform);
            return (
              <li key={r.id} className="flex items-center justify-between rounded-2xl border border-border/60 bg-card/40 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{p?.name ?? r.platform}</p>
                  <p className="text-xs text-muted-foreground">
                    Last sync: {r.last_synced_at ? new Date(r.last_synced_at).toLocaleString() : "never"} · {r.status ?? "unknown"}
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={() => syncOne(r.id, p?.name ?? r.platform)}>
                  <RefreshCw className="mr-1.5 h-3.5 w-3.5" />Sync now
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </DevCenterShell>
  );
}
