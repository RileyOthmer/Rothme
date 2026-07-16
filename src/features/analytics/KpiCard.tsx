import { Link } from "@tanstack/react-router";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import {
  type Metric,
  type RangeDays,
  formatDelta,
  formatMetric,
  generateSeries,
} from "./kpis";
import { Sparkline } from "./Sparkline";

export function KpiCard({ metric, range }: { metric: Metric; range: RangeDays }) {
  const series = generateSeries(metric.id, range);
  const positive = metric.higherIsBetter ? series.delta >= 0 : series.delta <= 0;
  const flat = Math.abs(series.delta) < 0.0005;
  const DeltaIcon = flat ? Minus : positive ? ArrowUpRight : ArrowDownRight;

  return (
    <Link
      to="/analytics/$metric"
      params={{ metric: metric.id }}
      search={{ range: (range as 7 | 14 | 30 | 90) }}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {metric.label}
          </div>
          <div className="mt-2 truncate text-3xl font-semibold tracking-tight tabular-nums">
            {formatMetric(series.currentTotal, metric.format)}
          </div>
        </div>
        <span
          className={
            "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-xs font-medium tabular-nums " +
            (flat
              ? "bg-muted text-muted-foreground"
              : positive
                ? "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400"
                : "bg-destructive/12 text-destructive")
          }
        >
          <DeltaIcon className="h-3 w-3" />
          {formatDelta(series.delta)}
        </span>
      </div>
      <div className="mt-4">
        <Sparkline points={series.current} positive={positive} height={40} />
      </div>
      <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>vs previous {range}d</span>
        <span className="tabular-nums">
          was {formatMetric(series.previousTotal, metric.format)}
        </span>
      </div>
    </Link>
  );
}
