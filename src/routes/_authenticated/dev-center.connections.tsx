import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { DevCenterShell, EmptyPanel } from "@/features/dev-center/DevCenterShell";
import { Badge } from "@/components/ui/badge";
import { useActiveOrg } from "@/features/collab/useActiveOrg";
import { listSocialConnections } from "@/lib/social/social.functions";
import { findPlatform } from "@/lib/dev-center/social-platforms";

export const Route = createFileRoute("/_authenticated/dev-center/connections")({
  component: ConnectionsPage,
});

function ConnectionsPage() {
  const org = useActiveOrg();
  const listFn = useServerFn(listSocialConnections);
  const q = useQuery({
    queryKey: ["dev-center", "connections", org.data?.id],
    queryFn: () => listFn({ data: { orgId: org.data!.id } }),
    enabled: !!org.data?.id,
  });

  const rows = (q.data ?? []) as Array<{
    id: string; platform: string; status: string | null;
    health_score: number | null; last_synced_at: string | null;
    external_handle: string | null; external_account_id: string | null;
    created_at: string;
  }>;

  return (
    <DevCenterShell
      title="Connected Accounts"
      description="Every account authorized against this workspace. Credentials are encrypted at rest and scoped to the organization."
    >
      {rows.length === 0 ? (
        <EmptyPanel title="No accounts connected yet" body="Head to Integrations to connect the first platform through its official OAuth flow." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border/60">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-2 text-left">Platform</th>
                <th className="px-4 py-2 text-left">Account</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Health</th>
                <th className="px-4 py-2 text-left">Last sync</th>
                <th className="px-4 py-2 text-left">Connected</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const p = findPlatform(r.platform);
                return (
                  <tr key={r.id} className="border-t border-border/50">
                    <td className="px-4 py-2 font-medium">{p?.name ?? r.platform}</td>
                    <td className="px-4 py-2 text-muted-foreground">{r.external_handle ?? r.external_account_id ?? "—"}</td>
                    <td className="px-4 py-2"><StatusBadge status={r.status} /></td>
                    <td className="px-4 py-2">{r.health_score == null ? "—" : `${r.health_score}/100`}</td>
                    <td className="px-4 py-2 text-muted-foreground">{r.last_synced_at ? new Date(r.last_synced_at).toLocaleString() : "—"}</td>
                    <td className="px-4 py-2 text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </DevCenterShell>
  );
}

function StatusBadge({ status }: { status: string | null }) {
  const s = status ?? "unknown";
  const cls =
    s === "connected" ? "border-emerald-500/40 text-emerald-600" :
    s === "degraded"  ? "border-amber-500/40 text-amber-600"    :
    s === "error"     ? "border-red-500/40 text-red-600"        :
                        "border-muted-foreground/30 text-muted-foreground";
  return <Badge variant="outline" className={`rounded-full ${cls}`}>{s}</Badge>;
}
