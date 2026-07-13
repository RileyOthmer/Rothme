import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { useMemo } from "react";

import { AppHeader } from "@/components/layout/AppHeader";
import { AnalyticsHubNav } from "@/features/analytics/AnalyticsHubNav";
import { KpiCard } from "@/features/analytics/KpiCard";
import { RangePicker } from "@/features/analytics/RangePicker";
import {
  CATEGORY_LABEL,
  METRICS,
  RANGE_OPTIONS,
  type MetricCategory,
  type RangeDays,
} from "@/features/analytics/kpis";

const searchSchema = z.object({
  range: z
    .union([z.literal(7), z.literal(14), z.literal(30), z.literal(90)])
    .catch(30),
});

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — Velora" },
      {
        name: "description",
        content:
          "Every metric that matters across every connected channel, in one place. Followers, reach, engagement, revenue, ROAS — with plain-English change vs the previous period.",
      },
    ],
  }),
  validateSearch: (s) => searchSchema.parse(s),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const { range } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const setRange = (r: RangeDays) =>
    navigate({ search: () => ({ range: r }), replace: true });


  const groups = useMemo(() => {
    const map = new Map<MetricCategory, typeof METRICS>();
    for (const m of METRICS) {
      if (!map.has(m.category)) map.set(m.category, []);
      map.get(m.category)!.push(m);
    }
    return [...map.entries()];
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <main className="mx-auto max-w-6xl space-y-10 px-4 py-10 sm:px-6 sm:py-14">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Analytics
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Everything that moved, in one view.
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Compared to the previous {range} days. Tap any card for the full story.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/analytics/unified"
              className="text-xs font-medium text-primary underline-offset-4 hover:underline"
            >
              Unified view →
            </Link>
            <Link
              to="/analytics/charts"
              search={{ range: range as RangeDays }}
              className="text-xs font-medium text-primary underline-offset-4 hover:underline"
            >
              Charts →
            </Link>
            <RangePicker value={range as RangeDays} onChange={setRange} />
          </div>
        </header>


        {groups.map(([category, metrics]) => (
          <section key={category} className="space-y-4">
            <div className="flex items-baseline justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                {CATEGORY_LABEL[category]}
              </h2>
              <span className="text-xs text-muted-foreground">
                {metrics.length} {metrics.length === 1 ? "metric" : "metrics"}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {metrics.map((m) => (
                <KpiCard key={m.id} metric={m} range={range as RangeDays} />
              ))}
            </div>
          </section>
        ))}

        <footer className="pt-4 text-xs text-muted-foreground">
          Ranges available: {RANGE_OPTIONS.map((r) => `${r}d`).join(" · ")}.{" "}
          <Link to="/settings/connections" className="underline underline-offset-4 hover:text-foreground">
            Connect more channels
          </Link>{" "}
          to enrich these numbers.
        </footer>
      </main>
    </div>
  );
}
