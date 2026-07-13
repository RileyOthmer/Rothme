import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { ArrowLeft, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

import { AppHeader } from "@/components/layout/AppHeader";
import { RangePicker } from "@/features/analytics/RangePicker";
import { Sparkline } from "@/features/analytics/Sparkline";
import {
  CATEGORY_LABEL,
  formatDelta,
  formatMetric,
  generateSeries,
  getMetric,
  type RangeDays,
} from "@/features/analytics/kpis";

const searchSchema = z.object({
  range: z
    .union([z.literal(7), z.literal(14), z.literal(30), z.literal(90)])
    .catch(30),
});

export const Route = createFileRoute("/_authenticated/analytics/$metric")({
  validateSearch: (s) => searchSchema.parse(s),
  loader: ({ params }) => {
    const metric = getMetric(params.metric);
    if (!metric) throw notFound();
    return { metric };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData
          ? `${loaderData.metric.label} — Analytics · Velora`
          : "Metric — Analytics · Velora",
      },
      { name: "description", content: loaderData?.metric.description ?? "" },
    ],
  }),
  notFoundComponent: () => (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <p className="text-sm text-muted-foreground">That metric isn't available yet.</p>
        <Link to="/analytics" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
          <ArrowLeft className="h-4 w-4" /> Back to analytics
        </Link>
      </main>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <p className="text-sm text-destructive">{error.message}</p>
      </main>
    </div>
  ),
  component: MetricDetail,
});

function MetricDetail() {
  const { metric } = Route.useLoaderData();
  const { range } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const series = generateSeries(metric.id, range as RangeDays);
  const positive = metric.higherIsBetter ? series.delta >= 0 : series.delta <= 0;
  const flat = Math.abs(series.delta) < 0.0005;
  const DeltaIcon = flat ? Minus : positive ? ArrowUpRight : ArrowDownRight;

  const best = series.current.reduce(
    (b, p) => (p.value > b.value ? p : b),
    series.current[0] ?? { day: "", value: 0 },
  );
  const worst = series.current.reduce(
    (b, p) => (p.value < b.value ? p : b),
    series.current[0] ?? { day: "", value: 0 },
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <main className="mx-auto max-w-4xl space-y-10 px-4 py-10 sm:px-6 sm:py-14">
        <div>
          <Link
            to="/analytics"
            search={{ range: range as RangeDays }}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Analytics
          </Link>
        </div>

        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {CATEGORY_LABEL[metric.category]}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              {metric.label}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              {metric.description}
            </p>
          </div>
          <RangePicker
            value={range as RangeDays}
            onChange={(r) => navigate({ search: (prev) => ({ ...prev, range: r }), replace: true })}
          />
        </header>

        <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <div className="flex flex-wrap items-baseline gap-4">
            <div className="text-5xl font-semibold tabular-nums tracking-tight sm:text-6xl">
              {formatMetric(series.currentTotal, metric.format)}
            </div>
            <span
              className={
                "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-medium tabular-nums " +
                (flat
                  ? "bg-muted text-muted-foreground"
                  : positive
                    ? "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400"
                    : "bg-destructive/12 text-destructive")
              }
            >
              <DeltaIcon className="h-3.5 w-3.5" />
              {formatDelta(series.delta)}
            </span>
            <span className="text-sm text-muted-foreground">
              vs {formatMetric(series.previousTotal, metric.format)} previous {range} days
            </span>
          </div>

          <div className="mt-8 h-56">
            <Sparkline points={series.current} positive={positive} height={220} />
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          <StatBlock label="Best day" value={formatMetric(best.value, metric.format)} sub={best.day} />
          <StatBlock label="Slowest day" value={formatMetric(worst.value, metric.format)} sub={worst.day} />
          <StatBlock
            label="Daily average"
            value={formatMetric(
              series.current.reduce((s, p) => s + p.value, 0) / Math.max(series.current.length, 1),
              metric.format,
            )}
            sub={`across ${series.current.length} days`}
          />
        </section>

        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Day by day
          </h2>
          <div className="mt-4 max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card text-left text-xs text-muted-foreground">
                <tr>
                  <th className="py-2 font-medium">Day</th>
                  <th className="py-2 text-right font-medium">{metric.label}</th>
                </tr>
              </thead>
              <tbody>
                {[...series.current].reverse().map((p) => (
                  <tr key={p.day} className="border-t border-border/60">
                    <td className="py-2">{p.day}</td>
                    <td className="py-2 text-right tabular-nums">
                      {formatMetric(p.value, metric.format)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

function StatBlock({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-2 text-2xl font-semibold tabular-nums">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{sub}</div>
    </div>
  );
}
