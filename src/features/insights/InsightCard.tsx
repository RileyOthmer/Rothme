import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  Clock,
  AlertTriangle,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { Insight, InsightCategory } from "./types";

const CATEGORY_LABEL: Record<InsightCategory, string> = {
  engagement: "Engagement",
  content: "Content",
  platform: "Platform",
  audience: "Audience",
  advertising: "Advertising",
  revenue: "Revenue",
};

function confidence(pct: number) {
  if (pct >= 80) return { label: "High confidence", tone: "text-emerald-600 dark:text-emerald-400" };
  if (pct >= 60) return { label: "Medium confidence", tone: "text-amber-600 dark:text-amber-400" };
  return { label: "Low confidence — needs more data", tone: "text-muted-foreground" };
}

function freshness(hours: number) {
  if (hours < 24) return null;
  if (hours < 48) return "Data is ~1 day old";
  return `Data is ~${Math.round(hours / 24)} days old`;
}

function DirectionIcon({ direction }: { direction: Insight["direction"] }) {
  if (direction === "up")
    return <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
  if (direction === "down")
    return <TrendingDown className="h-4 w-4 text-destructive" />;
  return <Minus className="h-4 w-4 text-muted-foreground" />;
}

export function InsightCard({ insight }: { insight: Insight }) {
  const [open, setOpen] = useState(false);
  const conf = confidence(insight.confidencePct);
  const stale = freshness(insight.dataFreshnessHours);

  return (
    <article className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground/80">
          <DirectionIcon direction={insight.direction} />
          {CATEGORY_LABEL[insight.category]}
        </span>
        {typeof insight.changePct === "number" && (
          <span className="text-xs font-medium tabular-nums text-muted-foreground">
            {insight.changePct > 0 ? "+" : ""}
            {insight.changePct}%
          </span>
        )}
        <span className={`text-xs font-medium ${conf.tone}`}>
          {conf.label} · {insight.confidencePct}%
        </span>
        {stale && (
          <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-3 w-3" />
            {stale}
          </span>
        )}
      </div>

      {/* What happened */}
      <h3 className="mt-3 text-lg font-semibold leading-snug">{insight.headline}</h3>

      {/* Why (from the data) */}
      <div className="mt-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Why (from the data)
        </p>
        <p className="mt-1 text-sm leading-relaxed text-foreground/90">{insight.reason}</p>
      </div>

      {/* Evidence — collapsed by default */}
      <Collapsible open={open} onOpenChange={setOpen} className="mt-4">
        <CollapsibleTrigger asChild>
          <button className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
            />
            {open ? "Hide" : "Show"} the numbers behind this
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3">
          <ul className="divide-y divide-border/60 rounded-lg border border-border/60">
            {insight.evidence.map((e) => (
              <li
                key={e.label}
                className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
              >
                <div className="min-w-0">
                  <p className="truncate text-foreground">{e.label}</p>
                  <p className="text-xs text-muted-foreground">{e.source}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-foreground tabular-nums">{e.value}</p>
                  {e.change && <p className="text-xs text-muted-foreground">{e.change}</p>}
                </div>
              </li>
            ))}
          </ul>
        </CollapsibleContent>
      </Collapsible>

      <p className="mt-4 flex items-center gap-1 text-xs text-muted-foreground">
        <Clock className="h-3 w-3" />
        Rothme reports observations from your connected data. It does not recommend actions.
      </p>
    </article>
  );
}
