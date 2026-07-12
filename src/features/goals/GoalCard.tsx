import { useState } from "react";
import {
  Sparkles,
  ChevronDown,
  Calendar,
  TrendingUp,
  Trash2,
  Pencil,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { computeForecast } from "./forecast";
import { formatMetricValue, METRIC_LABEL, STATUS_LABEL } from "./types";
import type { Goal, GoalStatus } from "./types";

const STATUS_TONE: Record<GoalStatus, { bar: string; text: string; chip: string }> = {
  achieved: {
    bar: "bg-emerald-500",
    text: "text-emerald-600 dark:text-emerald-400",
    chip: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  on_track: {
    bar: "bg-primary",
    text: "text-primary",
    chip: "bg-primary/10 text-primary border-primary/20",
  },
  at_risk: {
    bar: "bg-amber-500",
    text: "text-amber-600 dark:text-amber-400",
    chip: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  behind: {
    bar: "bg-destructive",
    text: "text-destructive",
    chip: "bg-destructive/10 text-destructive border-destructive/20",
  },
};

function formatDate(iso: string) {
  return new Date(iso + (iso.length === 10 ? "T00:00:00Z" : "")).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function Sparkline({ points, tone }: { points: number[]; tone: string }) {
  if (points.length < 2) return null;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const w = 240;
  const h = 44;
  const step = w / (points.length - 1);
  const path = points
    .map((v, i) => `${i === 0 ? "M" : "L"}${(i * step).toFixed(1)} ${(h - ((v - min) / range) * h).toFixed(1)}`)
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={`h-11 w-full ${tone}`} preserveAspectRatio="none">
      <path d={path} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export type GoalCardProps = {
  goal: Goal;
  onUpdate: (goal: Goal) => void;
  onDelete: (id: string) => void;
};

export function GoalCard({ goal, onUpdate, onDelete }: GoalCardProps) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [currentDraft, setCurrentDraft] = useState(String(goal.current));

  const forecast = computeForecast(goal);
  const tone = STATUS_TONE[forecast.status];
  const pct = Math.min(100, Math.max(0, forecast.progressPct));

  function saveCurrent() {
    const parsed = Number(currentDraft);
    if (Number.isNaN(parsed)) return;
    onUpdate({ ...goal, current: parsed });
    setEditing(false);
  }

  return (
    <article className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${tone.chip}`}>
          {STATUS_LABEL[forecast.status]}
        </span>
        <span className="text-xs text-muted-foreground">{METRIC_LABEL[goal.metric]}</span>
        {goal.source === "ai_recommended" && (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            <Sparkles className="h-3 w-3" />
            AI recommended
          </span>
        )}
        <span className="ml-auto text-xs text-muted-foreground">
          Due {formatDate(goal.dueDate)}
        </span>
      </div>

      <h3 className="mt-3 text-lg font-semibold leading-snug text-foreground">{goal.title}</h3>

      {/* Progress + numbers */}
      <div className="mt-4">
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <div className="tabular-nums text-2xl font-semibold text-foreground">
              {formatMetricValue(goal.metric, goal.current)}
              <span className="ml-1 text-sm font-normal text-muted-foreground">
                of {formatMetricValue(goal.metric, goal.target)}
              </span>
            </div>
            <div className={`mt-0.5 text-xs font-medium ${tone.text}`}>
              {Math.round(pct)}% complete
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Forecast at due date</div>
            <div className="tabular-nums text-sm font-medium text-foreground">
              {formatMetricValue(goal.metric, forecast.projected)}
            </div>
          </div>
        </div>

        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-all duration-700 ${tone.bar}`}
            style={{ width: `${pct}%` }}
          />
        </div>

        <p className="mt-3 text-sm text-foreground/90">{forecast.summary}</p>
      </div>

      {/* Facts row */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Fact icon={<Calendar className="h-3.5 w-3.5" />} label="Estimated completion">
          {forecast.estimatedCompletion
            ? formatDate(forecast.estimatedCompletion)
            : "Not on pace yet"}
        </Fact>
        <Fact icon={<TrendingUp className="h-3.5 w-3.5" />} label="Business impact">
          <span className="capitalize">{goal.impact}</span>
        </Fact>
        <Fact icon={<Sparkles className="h-3.5 w-3.5" />} label="Confidence">
          {goal.confidencePct}%
        </Fact>
      </div>

      {/* Recommendation */}
      <div className="mt-4 rounded-xl border border-border/60 bg-muted/40 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Recommendation
        </p>
        <p className="mt-1 text-sm leading-relaxed text-foreground">{goal.recommendation}</p>
        <p className="mt-2 text-xs italic text-muted-foreground">Why it matters: {goal.impactReason}</p>
      </div>

      {/* History collapsible */}
      <Collapsible open={open} onOpenChange={setOpen} className="mt-4">
        <CollapsibleTrigger asChild>
          <button className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
            {open ? "Hide" : "Show"} history
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3 space-y-3">
          <Sparkline points={goal.history.map((p) => p.value)} tone={tone.text} />
          <ul className="divide-y divide-border/60 rounded-lg border border-border/60 text-sm">
            {goal.history
              .slice()
              .reverse()
              .map((p) => (
                <li key={p.date} className="flex items-center justify-between px-3 py-1.5">
                  <span className="text-muted-foreground">{formatDate(p.date)}</span>
                  <span className="tabular-nums text-foreground">
                    {formatMetricValue(goal.metric, p.value)}
                  </span>
                </li>
              ))}
          </ul>
        </CollapsibleContent>
      </Collapsible>

      {/* Actions */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        {editing ? (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={currentDraft}
              onChange={(e) => setCurrentDraft(e.target.value)}
              className="h-8 w-32"
              aria-label="Current value"
            />
            <Button size="sm" onClick={saveCurrent}>
              <Check className="mr-1.5 h-4 w-4" />
              Save
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        ) : (
          <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>
            <Pencil className="mr-1.5 h-4 w-4" />
            Update progress
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          className="ml-auto text-muted-foreground"
          onClick={() => onDelete(goal.id)}
        >
          <Trash2 className="mr-1.5 h-4 w-4" />
          Remove
        </Button>
      </div>
    </article>
  );
}

function Fact({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2">
      <div className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-0.5 text-sm text-foreground">{children}</div>
    </div>
  );
}
