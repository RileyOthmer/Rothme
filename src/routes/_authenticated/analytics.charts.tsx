import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";

import { AppHeader } from "@/components/layout/AppHeader";
import { RangePicker } from "@/features/analytics/RangePicker";
import type { RangeDays } from "@/features/analytics/kpis";

import { PerformanceLineChart } from "@/features/charts/charts/PerformanceLineChart";
import { PlatformBarChart } from "@/features/charts/charts/PlatformBarChart";
import { DemographicsDonut } from "@/features/charts/charts/DemographicsDonut";
import { PostingHeatmap } from "@/features/charts/charts/PostingHeatmap";
import { MarketingFunnel } from "@/features/charts/charts/MarketingFunnel";
import { OrganicVsPaid } from "@/features/charts/charts/OrganicVsPaid";
import { GeographicMap } from "@/features/charts/charts/GeographicMap";
import { CampaignCompare } from "@/features/charts/charts/CampaignCompare";
import { GoalProgress } from "@/features/charts/charts/GoalProgress";

const searchSchema = z.object({
  range: z.union([z.literal(7), z.literal(14), z.literal(30), z.literal(90)]).catch(30),
});

export const Route = createFileRoute("/_authenticated/analytics/charts")({
  head: () => ({
    meta: [
      { title: "Charts — Velora" },
      {
        name: "description",
        content:
          "Interactive charts across every channel: performance over time, platform comparison, demographics, funnel, organic vs paid, and campaign performance. Zoom, filter, export.",
      },
    ],
  }),
  validateSearch: (s) => searchSchema.parse(s),
  component: ChartsPage,
});

function ChartsPage() {
  const { range } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const setRange = (r: RangeDays) => navigate({ search: () => ({ range: r }), replace: true });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6 sm:py-14">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Analytics · Charts
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Everything that moved, visualised.
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Every chart supports hover tooltips, zoom, filters, PNG / CSV export, and full report download.
            </p>
          </div>
          <RangePicker value={range as RangeDays} onChange={setRange} />
        </header>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="lg:col-span-2">
            <PerformanceLineChart range={range as RangeDays} />
          </div>
          <PlatformBarChart />
          <DemographicsDonut />
          <div className="lg:col-span-2">
            <PostingHeatmap />
          </div>
          <MarketingFunnel />
          <OrganicVsPaid range={range as RangeDays} />
          <div className="lg:col-span-2">
            <GeographicMap />
          </div>
          <CampaignCompare />
          <GoalProgress />
        </div>
      </main>
    </div>
  );
}
