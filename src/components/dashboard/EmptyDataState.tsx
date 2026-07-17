import { Link } from "@tanstack/react-router";
import { Plug, ArrowRight } from "lucide-react";

/**
 * Shown across dashboards and analytics until the user connects a data source.
 * Everything reads as zero / no data so nothing looks fabricated.
 */
export function EmptyDataState({
  title = "No marketing platforms connected.",
  description = "Connect a platform and your real followers, reach, engagement, and revenue will populate here. Until then, everything stays at zero — Rothme never shows sample data.",
  ctaLabel = "Connect Your First Platform",
  to = "/settings/platforms",
}: {
  title?: string;
  description?: string;
  ctaLabel?: string;
  to?: string;
}) {
  return (
    <section className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center sm:p-12">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-border bg-surface-2 text-muted-foreground">
        <Plug className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-foreground">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      <Link
        to={to}
        className="mt-5 inline-flex h-9 items-center gap-1.5 rounded-lg bg-foreground px-4 text-xs font-medium text-background transition-opacity hover:opacity-90"
      >
        {ctaLabel}
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </section>
  );
}

export type ZeroStat = { label: string; value?: string };

/**
 * Renders a grid of KPI cards locked at 0. Never accepts real values —
 * this component is intentionally read-only until the data engine has
 * actual tracked metrics for the user.
 */
export function ZeroStatGrid({
  stats,
  labels,
}: {
  stats?: ZeroStat[];
  /** Legacy: string[] of labels — each renders as "0". */
  labels?: string[];
}) {
  const items: ZeroStat[] = stats ?? (labels ?? []).map((label) => ({ label }));
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((s) => (
        <div key={s.label} className="rounded-xl border border-border bg-surface p-4">
          <div className="text-xs text-muted-foreground">{s.label}</div>
          <div className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
            {s.value ?? "0"}
          </div>
          <div className="mt-0.5 text-[11px] text-muted-foreground">No data yet</div>
        </div>
      ))}
    </div>
  );
}
