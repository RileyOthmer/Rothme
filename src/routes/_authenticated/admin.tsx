import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { Shield, KeyRound, Users, DollarSign, Network, Activity, LayoutDashboard } from "lucide-react";
import { useIsAdmin } from "@/hooks/use-is-admin";
import { useServerFn } from "@tanstack/react-start";
import { claimFirstAdmin } from "@/lib/admin/credentials.functions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin Console — ROTHME" },
      { name: "description", content: "Manage social platform credentials, users, revenue, and system health." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

const TABS: Array<{ to: string; label: string; icon: typeof Shield; exact?: boolean }> = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/credentials", label: "Credentials", icon: KeyRound },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/revenue", label: "Revenue", icon: DollarSign },
  { to: "/admin/connections", label: "Connections", icon: Network },
  { to: "/admin/health", label: "System Health", icon: Activity },
];

function AdminLayout() {
  const { isAdmin, anyAdminExists, isLoading } = useIsAdmin();
  const { pathname } = useLocation();

  if (isLoading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="animate-pulse text-sm text-muted-foreground">Checking access…</div>
      </main>
    );
  }
  if (!isAdmin) {
    // Hide the admin surface entirely from non-admins. Only expose the
    // one-time claim flow when no admin exists yet (first-run bootstrap).
    if (anyAdminExists) return <NotFound />;
    return <ClaimFirstAdmin />;
  }


  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <header className="mb-6 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-surface">
          <Shield className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-semibold">Admin Console</h1>
          <p className="text-sm text-muted-foreground">Platform credentials, revenue, connections, and health — all in one place.</p>
        </div>
      </header>

      <nav className="mb-6 flex flex-wrap gap-1 rounded-xl border border-border bg-surface p-1" aria-label="Admin sections">
        {TABS.map((t) => {
          const active = t.exact ? pathname === t.to : pathname.startsWith(t.to);
          return (
            <Link
              key={t.to}
              to={t.to as "/admin"}
              className={
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors " +
                (active ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground")
              }
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
            </Link>
          );
        })}
      </nav>

      <Outlet />
    </main>
  );
}

function NotFound() {
  return (
    <main className="mx-auto max-w-md px-4 py-24 sm:px-6 text-center">
      <h1 className="text-lg font-semibold">Page not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        The page you're looking for doesn't exist.
      </p>
      <Link to="/dashboard" className="mt-6 inline-flex h-9 items-center rounded-lg bg-foreground px-4 text-xs font-medium text-background">
        Back to dashboard
      </Link>
    </main>
  );
}

function ClaimFirstAdmin() {
  const claim = useServerFn(claimFirstAdmin);
  const qc = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const mut = useMutation({
    mutationFn: () => claim({}),
    onSuccess: () => {
      toast.success("You are now the platform admin");
      qc.invalidateQueries({ queryKey: ["admin", "is-admin"] });
    },
    onError: (e: Error) => setError(e.message),
  });

  return (
    <main className="mx-auto max-w-md px-4 py-24 sm:px-6">
      <div className="rounded-2xl border border-border bg-surface p-8 text-center">
        <Shield className="mx-auto h-8 w-8 text-muted-foreground" />
        <h1 className="mt-4 text-lg font-semibold">Claim admin access</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          No platform admin exists yet. Claim it now to configure the workspace.
        </p>
        <button
          onClick={() => mut.mutate()}
          disabled={mut.isPending}
          className="mt-6 inline-flex h-9 items-center rounded-lg bg-foreground px-4 text-xs font-medium text-background disabled:opacity-50"
        >
          {mut.isPending ? "Claiming…" : "Claim admin role"}
        </button>
        {error ? <p className="mt-3 text-xs text-destructive">{error}</p> : null}
      </div>
    </main>
  );
}

