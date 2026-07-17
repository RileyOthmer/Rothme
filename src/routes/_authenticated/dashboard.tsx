import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";

import { getProfile } from "@/lib/profile.functions";
import { AppHeader } from "@/components/layout/AppHeader";
import { DecisionCenter } from "@/features/decisions/DecisionCenter";
import { DashboardWidget, WIDGETS } from "@/features/dashboard/DashboardWidget";
import { ProWelcome, ProChecklist } from "@/features/dashboard/ProWelcome";
import { QuickActions } from "@/components/assistant/QuickActions";
import { EmptyDataState, ZeroStatGrid } from "@/components/dashboard/EmptyDataState";
import { RecentActivity } from "@/features/activity/RecentActivity";
import { useHasConnections } from "@/hooks/use-has-connections";
import {
  loadDashboardPrefs,
  type DashboardPrefs,
  type WidgetId,
} from "@/features/dashboard/preferences";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Decisions — ROTHME" },
      {
        name: "description",
        content:
          "The AI Decision Center. A short, calm list of what to do today for your marketing — with the reason, the impact, and how confident ROTHME is.",
      },
    ],
  }),
  component: DashboardPage,
});

const DEFAULT_ORDER: WidgetId[] = [
  "ai", "analytics", "scheduling", "inbox", "accounts", "collab",
];

function DashboardPage() {
  const router = useRouter();
  const fetchProfile = useServerFn(getProfile);
  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: () => fetchProfile(),
  });
  const { hasConnections } = useHasConnections();

  const [prefs, setPrefs] = useState<DashboardPrefs | null>(null);
  useEffect(() => {
    setPrefs(loadDashboardPrefs());
  }, []);

  useEffect(() => {
    if (profileQuery.data && !profileQuery.data.onboarded_at) {
      router.navigate({ to: "/onboarding" });
    }
  }, [profileQuery.data, router]);

  const firstName = profileQuery.data?.full_name?.split(" ")[0] ?? "there";

  const order = prefs?.priority ?? DEFAULT_ORDER;
  const primary = order[0];
  const primaryMeta = WIDGETS[primary];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ProWelcome />
      <AppHeader />

      <main className="mx-auto max-w-5xl space-y-10 px-4 py-10 sm:px-6 sm:py-14">
        <section>
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Welcome back, {firstName}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            {prefs
              ? `Your workspace, tuned for ${primaryMeta.title.toLowerCase()}.`
              : "Your workspace."}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            {prefs
              ? "The tools you told us matter most are pinned to the top. Everything else is one click away."
              : "Start by connecting an account or asking ROTHME anything."}
          </p>
        </section>

        <ProChecklist />

        <QuickActions />


        {/*
         * Zero-until-tracked policy: connecting an account creates a row, but
         * that alone doesn't mean we have real, ingested analytics yet. Until
         * the data engine actually has tracked metrics for this user, every
         * KPI, score, and insight on the dashboard MUST read as 0 / no data —
         * never seeded, never AI-fabricated. When real ingestion lands, flip
         * this gate to check for the presence of MetricSnapshots (or similar)
         * and only then render HealthScoreCard / DashboardInsightsSection.
         */}
        <ZeroStatGrid
          stats={[
            { label: "Followers" },
            { label: "Reach" },
            { label: "Engagement" },
            { label: "Posts" },
            { label: "Connected Platforms" },
            { label: "Campaigns" },
            { label: "Revenue", value: "$0" },
          ]}
        />
        {!hasConnections && (
          <EmptyDataState
            title="No marketing platforms connected."
            description="Connect a platform and your real followers, reach, engagement, and revenue will populate here. Until then, everything stays at zero — Rothme never shows sample data."
            ctaLabel="Connect Your First Platform"
            to="/settings/platforms"
          />
        )}

        <section aria-labelledby="widgets-heading" className="space-y-4">
          <h2 id="widgets-heading" className="sr-only">Shortcuts</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {order.map((id, i) => (
              <DashboardWidget key={id} widgetId={id} primary={i === 0} />
            ))}
          </div>
        </section>

        <RecentActivity />

        <DecisionCenter firstName={firstName} hasConnections={false} />
      </main>

      <Toaster position="bottom-right" />
    </div>
  );
}
