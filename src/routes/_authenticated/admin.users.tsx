import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getUserStats } from "@/lib/admin/stats.functions";

export const Route = createFileRoute("/_authenticated/admin/users")({
  component: UsersPage,
});

function UsersPage() {
  const fn = useServerFn(getUserStats);
  const q = useQuery({ queryKey: ["admin", "users"], queryFn: () => fn({}) });

  if (q.isLoading) return <div className="text-sm text-muted-foreground">Loading…</div>;
  if (q.error) return <div className="text-sm text-destructive">{(q.error as Error).message}</div>;
  const d = q.data!;

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Total users" value={d.total} />
        <Stat label="New (7 days)" value={d.newLast7} />
        <Stat label="New (30 days)" value={d.newLast30} />
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold">Recent signups</h2>
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          <table className="w-full text-sm">
            <thead className="bg-surface-2/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-2 text-left font-medium">Name</th>
                <th className="px-4 py-2 text-left font-medium">Business</th>
                <th className="px-4 py-2 text-left font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {d.recent.length === 0 ? (
                <tr><td colSpan={3} className="px-4 py-6 text-center text-xs text-muted-foreground">No users yet.</td></tr>
              ) : d.recent.map((u) => (
                <tr key={u.id} className="border-t border-border">
                  <td className="px-4 py-2">{u.full_name ?? "—"}</td>
                  <td className="px-4 py-2 text-muted-foreground">{u.business_name ?? "—"}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{new Date(u.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">{value.toLocaleString()}</div>
    </div>
  );
}
