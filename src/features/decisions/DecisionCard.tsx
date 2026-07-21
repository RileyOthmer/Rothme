import { useState } from "react";
import { BellOff, X, ChevronDown, AlertTriangle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { Decision, ObservationCategory } from "./types";

const CATEGORY_LABEL: Record<ObservationCategory, string> = {
  notable: "Notable change",
  steady: "Within normal range",
  watch: "Worth watching",
};

const CATEGORY_STYLES: Record<ObservationCategory, string> = {
  notable: "bg-primary/10 text-primary border-primary/20",
  steady: "bg-muted text-muted-foreground border-border",
  watch: "bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-300",
};

function confidenceLabel(pct: number): { label: string; tone: string } {
  if (pct >= 80) return { label: "High confidence", tone: "text-emerald-600 dark:text-emerald-400" };
  if (pct >= 60) return { label: "Medium confidence", tone: "text-amber-600 dark:text-amber-400" };
  return { label: "Low confidence — needs more data", tone: "text-muted-foreground" };
}

function freshnessLabel(hours: number): string | null {
  if (hours < 24) return null;
  if (hours < 48) return "Data is ~1 day old";
  return `Data is ~${Math.round(hours / 24)} days old`;
}

export type DecisionCardProps = {
  decision: Decision;
  onAccept?: (id: string) => void;
  onSnooze?: (id: string) => void;
  onDismiss?: (id: string) => void;
};

export function DecisionCard({ decision, onSnooze, onDismiss }: DecisionCardProps) {
  const [open, setOpen] = useState(decision.priority === "notable");
  const conf = confidenceLabel(decision.confidencePct);
  const stale = freshnessLabel(decision.dataFreshnessHours);

  return (
    <article className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
      {/* Header row */}
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${CATEGORY_STYLES[decision.priority]}`}
        >
          {CATEGORY_LABEL[decision.priority]}
        </span>
        <span className={`text-xs font-medium ${conf.tone}`}>
          {conf.label} · {decision.confidencePct}%
        </span>
        {stale && (
          <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-3 w-3" />
            {stale}
          </span>
        )}
      </div>

      {/* Headline (What happened) */}
      <h3 className="mt-3 text-lg font-semibold leading-snug text-foreground">
        {decision.headline}
      </h3>

      {/* Why (from the data) */}
      <div className="mt-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Why (from the data)
        </p>
        <p className="mt-1 text-sm leading-relaxed text-foreground/90">{decision.reason}</p>
      </div>

      {/* How this is calculated */}
      <div className="mt-4 rounded-xl border border-border/60 bg-muted/40 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          How this is calculated
        </p>
        <p className="mt-1 text-sm leading-relaxed text-foreground">{decision.recommendation}</p>
        <p className="mt-2 text-xs italic text-muted-foreground">
          Data source: {decision.estimatedResult}
        </p>
      </div>

      {/* Supporting data — collapsed by default (calm) */}
      <Collapsible open={open} onOpenChange={setOpen} className="mt-4">
        <CollapsibleTrigger asChild>
          <button className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
            />
            {open ? "Hide" : "Show"} the numbers behind this
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3">
          <ul className="divide-y divide-border/60 rounded-lg border border-border/60">
            {decision.supportingData.map((d) => (
              <li key={d.label} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                <div className="min-w-0">
                  <p className="truncate text-foreground">{d.label}</p>
                  <p className="text-xs text-muted-foreground">{d.source}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-foreground">{d.value}</p>
                  {d.change && <p className="text-xs text-muted-foreground">{d.change}</p>}
                </div>
              </li>
            ))}
          </ul>
        </CollapsibleContent>
      </Collapsible>

      {/* Actions — snooze/dismiss only. No "I'll do this" advice CTAs. */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Button size="sm" variant="ghost" onClick={() => onSnooze?.(decision.id)}>
          <BellOff className="mr-1.5 h-4 w-4" />
          Snooze
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="text-muted-foreground"
          onClick={() => onDismiss?.(decision.id)}
        >
          <X className="mr-1.5 h-4 w-4" />
          Dismiss
        </Button>
      </div>

      <p className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
        <Clock className="h-3 w-3" />
        Rothme reports observations. It does not decide what to do next.
      </p>
    </article>
  );
}
