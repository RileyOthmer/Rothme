import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Shield, KeyRound, Users, DollarSign, Network, Activity, LayoutDashboard, ShieldAlert, Crown } from "lucide-react";
import { useIsAdmin } from "@/hooks/use-is-admin";
import { checkIsMasterAdmin } from "@/lib/admin/roles.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin Console — ROTHME" },
      { name: "description", content: "Platform administration, subscriptions, integrations, and system health." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

const TABS: Array<{ to: string; label: string; icon: typeof Shield; exact?: boolean; masterOnly?: boolean }> = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/roles", label: "Roles", icon: Crown, masterOnly: true },
  { to: "/admin/credentials", label: "Credentials", icon: KeyRound },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/revenue", label: "Revenue", icon: DollarSign },
  { to: "/admin/connections", label: "Connections", icon: Network },
  { to: "/admin/health", label: "System Health", icon: Activity },
];

function AdminLayout() {
  const { isAdmin, isLoading } = useIsAdmin();
  const checkMaster = useServerFn(checkIsMasterAdmin);
  const masterQ = useQuery({
    queryKey: ["admin", "is-master-admin"],
    queryFn: () => checkMaster(),
    staleTime: 60_000,
    enabled: isAdmin,
  });
  const isMaster = masterQ.data?.isMasterAdmin ?? false;
  const { pathname } = useLocation();

  if (isLoading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="animate-pulse text-sm text-muted-foreground">Checking access…</div>
      </main>
    );
  }
  if (!isAdmin) return <AccessDenied />;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <header className="mb-6 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-surface">
          <Shield className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-semibold">Admin Console</h1>
          <p className="text-sm text-muted-foreground">Platform administration, subscriptions, integrations, and system health.</p>
        </div>
      </header>

      <nav className="mb-6 flex flex-wrap gap-1 rounded-xl border border-border bg-surface p-1" aria-label="Admin sections">
        {TABS.filter((t) => !t.masterOnly || isMaster).map((t) => {
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

function AccessDenied() {
  return (
    <main className="mx-auto max-w-md px-4 py-24 sm:px-6" role="alert" aria-labelledby="access-denied-title">
      <div className="rounded-2xl border border-border bg-surface p-8 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-destructive/10 text-destructive">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <div className="mt-4 text-xs font-medium uppercase tracking-wider text-destructive">403 · Forbidden</div>
        <h1 id="access-denied-title" className="mt-2 text-lg font-semibold">Access Denied</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You don't have permission to view this page. Admin access is granted by the platform team.
        </p>
        <Link
          to="/dashboard"
          className="mt-6 inline-flex h-9 items-center rounded-lg bg-foreground px-4 text-xs font-medium text-background hover:opacity-90"
        >
          Back to dashboard
        </Link>
      </div>
    </main>
  );
}
