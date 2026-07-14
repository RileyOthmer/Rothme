import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { DevCenterShell, EmptyPanel } from "@/features/dev-center/DevCenterShell";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useActiveOrg } from "@/features/collab/useActiveOrg";
import { listSocialEvents } from "@/lib/social/social.functions";
import { findPlatform } from "@/lib/dev-center/social-platforms";

export const Route = createFileRoute("/_authenticated/dev-center/logs")({
  component: LogsPage,
});

function LogsPage() {
  const org = useActiveOrg();
  const listFn = useServerFn(listSocialEvents);
  const q = useQuery({
    queryKey: ["dev-center", "events", org.data?.id],
    queryFn: () => listFn({ data: { orgId: org.data!.id, limit: 200 } }),
    enabled: !!org.data?.id,
  });
  const [filter, setFilter] = useState("");
  const rows = (q.data ?? []) as Array<{
    id: string; level: string; scope: string; event: string;
    platform: string | null; created_at: string; data: unknown;
  }>;
  const filtered = useMemo(() => {
    const f = filter.trim().toLowerCase();
    if (!f) return rows;
    return rows.filter((r) => [r.event, r.scope, r.platform ?? "", r.level].some((v) => v.toLowerCase().includes(f)));
  }, [rows, filter]);

  return (
    <DevCenterShell
      title="Logs"
      description="Connection, auth, publishing, sync, webhook, and error events across every integration. Filter by keyword; scope by platform."
    >
      <div className="mb-4">
        <Input placeholder="Filter events…" value={filter} onChange={(e) => setFilter(e.target.value)} />
      </div>
      {filtered.length === 0 ? (
        <EmptyPanel title="No events" body="Integration activity will appear here as soon as connections are made or sync jobs run." />
      ) : (
        <ul className="space-y-1.5 font-mono text-xs">
          {filtered.map((e) => {
            const p = e.platform ? findPlatform(e.platform) : null;
            const dot =
              e.level === "error" ? "bg-red-500"   :
              e.level === "warn"  ? "bg-amber-500" :
              e.level === "info"  ? "bg-emerald-500" : "bg-muted-foreground";
            return (
              <li key={e.id} className="flex items-start gap-3 rounded-lg border border-border/50 bg-card/30 px-3 py-2">
                <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />
                <span className="w-40 shrink-0 text-muted-foreground">{new Date(e.created_at).toLocaleString()}</span>
                <Badge variant="outline" className="rounded-full text-[10px]">{e.scope}</Badge>
                {p ? <Badge variant="outline" className="rounded-full text-[10px]">{p.name}</Badge> : null}
                <span className="min-w-0 flex-1 break-all">{e.event}</span>
              </li>
            );
          })}
        </ul>
      )}
    </DevCenterShell>
  );
}
