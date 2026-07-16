import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Shield, ShieldCheck, Trash2, UserPlus, Crown, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import {
  checkIsMasterAdmin,
  grantAdminByEmail,
  listAdmins,
  revokeAdmin,
} from "@/lib/admin/roles.functions";

export const Route = createFileRoute("/_authenticated/admin/roles")({
  component: RolesPage,
});

function RolesPage() {
  const checkMaster = useServerFn(checkIsMasterAdmin);
  const masterQ = useQuery({
    queryKey: ["admin", "is-master-admin"],
    queryFn: () => checkMaster(),
    staleTime: 60_000,
  });

  if (masterQ.isLoading) {
    return <div className="text-sm text-muted-foreground">Checking access…</div>;
  }
  if (!masterQ.data?.isMasterAdmin) return <MasterOnly />;

  return <RolesConsole />;
}

function MasterOnly() {
  return (
    <div className="rounded-2xl border border-border bg-surface p-8 text-center" role="alert">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-destructive/10 text-destructive">
        <ShieldAlert className="h-6 w-6" />
      </div>
      <h2 className="mt-4 text-lg font-semibold">Master admin only</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        Only the platform owner can grant or revoke admin roles. If you need access, contact the
        owner.
      </p>
    </div>
  );
}

function RolesConsole() {
  const qc = useQueryClient();
  const listFn = useServerFn(listAdmins);
  const grantFn = useServerFn(grantAdminByEmail);
  const revokeFn = useServerFn(revokeAdmin);

  const admins = useQuery({
    queryKey: ["admin", "roles", "list"],
    queryFn: () => listFn(),
  });

  const [email, setEmail] = useState("");

  const grant = useMutation({
    mutationFn: (e: string) => grantFn({ data: { email: e } }),
    onSuccess: () => {
      toast.success("Admin role granted");
      setEmail("");
      qc.invalidateQueries({ queryKey: ["admin", "roles", "list"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const revoke = useMutation({
    mutationFn: (userId: string) => revokeFn({ data: { userId } }),
    onSuccess: () => {
      toast.success("Admin role revoked");
      qc.invalidateQueries({ queryKey: ["admin", "roles", "list"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-surface p-5">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <UserPlus className="h-4 w-4" /> Grant admin access
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          The person must already have a Rothme account. Enter the email they signed up with.
        </p>
        <form
          className="mt-4 flex flex-col gap-2 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            if (email.trim()) grant.mutate(email.trim());
          }}
        >
          <input
            type="email"
            required
            placeholder="teammate@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-9 flex-1 rounded-lg border border-border bg-background px-3 text-sm"
          />
          <button
            type="submit"
            disabled={grant.isPending}
            className="h-9 rounded-lg bg-foreground px-4 text-xs font-medium text-background disabled:opacity-50"
          >
            {grant.isPending ? "Granting…" : "Grant admin"}
          </button>
        </form>
      </section>

      <section>
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <Shield className="h-4 w-4" /> Current admins
        </div>
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          {admins.isLoading ? (
            <div className="p-6 text-sm text-muted-foreground">Loading…</div>
          ) : admins.error ? (
            <div className="p-6 text-sm text-destructive">{(admins.error as Error).message}</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-surface-2/50 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">Name</th>
                  <th className="px-4 py-2 text-left font-medium">Email</th>
                  <th className="px-4 py-2 text-left font-medium">Granted</th>
                  <th className="px-4 py-2 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(admins.data ?? []).map((a) => (
                  <tr key={a.userId} className="border-t border-border">
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        {a.isMaster ? (
                          <Crown className="h-3.5 w-3.5 text-amber-500" />
                        ) : (
                          <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                        )}
                        <span>{a.fullName ?? "—"}</span>
                        {a.isMaster ? (
                          <span className="ml-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                            Master
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">{a.email ?? "—"}</td>
                    <td className="px-4 py-2 text-xs text-muted-foreground">
                      {a.grantedAt ? new Date(a.grantedAt).toLocaleString() : "—"}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {a.isMaster ? (
                        <span className="text-xs text-muted-foreground">Locked</span>
                      ) : (
                        <button
                          onClick={() => {
                            if (confirm(`Revoke admin from ${a.email ?? a.userId}?`)) {
                              revoke.mutate(a.userId);
                            }
                          }}
                          disabled={revoke.isPending}
                          className="inline-flex h-7 items-center gap-1 rounded-md border border-border bg-background px-2 text-xs font-medium text-destructive hover:bg-destructive/5 disabled:opacity-50"
                        >
                          <Trash2 className="h-3 w-3" /> Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {(admins.data ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-xs text-muted-foreground">
                      No admins configured.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
