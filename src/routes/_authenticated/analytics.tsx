import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppHeader } from "@/components/layout/AppHeader";
import { EmptyDataState, ZeroStatGrid } from "@/components/dashboard/EmptyDataState";
import { useHasConnections } from "@/hooks/use-has-connections";

export const Route = createFileRoute("/_authenticated/analytics")({
  component: AnalyticsLayout,
});

function AnalyticsLayout() {
  const { hasConnections, isLoading } = useHasConnections();

  if (!isLoading && !hasConnections) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <AppHeader />
        <main className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6 sm:py-14">
          <header>
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Analytics
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
              No analytics yet
            </h1>
          </header>
          <ZeroStatGrid labels={["Reach", "Engagement", "Followers", "Revenue"]} />
          <EmptyDataState
            title="Connect a data source to see analytics"
            description="Rothme won't show numbers we can't back up with your data. Connect a social account, ad platform, or website provider and every chart, KPI, and insight will populate with real values."
          />
        </main>
      </div>
    );
  }

  return <Outlet />;
}
