import { Sparkles, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getRecommendedGoals } from "./seed";
import { METRIC_LABEL, formatMetricValue } from "./types";
import type { Goal } from "./types";
import { newGoalId } from "./store";

const DAY = 24 * 60 * 60 * 1000;

export function RecommendedGoals({
  onAdd,
  existingMetrics,
}: {
  onAdd: (goal: Goal) => void;
  existingMetrics: Set<string>;
}) {
  const recs = getRecommendedGoals().filter((r) => !existingMetrics.has(r.metric));
  if (recs.length === 0) return null;

  return (
    <section className="rounded-2xl border border-dashed border-border bg-muted/20 p-6">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-medium text-foreground">Velora suggests</h2>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">
        Based on your recent numbers, these are realistic goals worth setting.
      </p>
      <ul className="space-y-3">
        {recs.map((rec) => (
          <li
            key={rec.metric}
            className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <span className="text-sm font-medium text-foreground">{rec.title}</span>
                <span className="text-xs capitalize text-muted-foreground">
                  · {rec.impact} impact
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{rec.reason}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Target: {formatMetricValue(rec.metric, rec.target)} · Timeframe:{" "}
                {rec.suggestedDurationDays} days
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => {
                const now = new Date();
                const goal: Goal = {
                  id: newGoalId(),
                  metric: rec.metric,
                  title: rec.title,
                  target: rec.target,
                  current: 0,
                  startValue: 0,
                  startDate: now.toISOString().slice(0, 10),
                  dueDate: new Date(now.getTime() + rec.suggestedDurationDays * DAY)
                    .toISOString()
                    .slice(0, 10),
                  impact: rec.impact,
                  impactReason: rec.reason,
                  recommendation: `Start by giving ${METRIC_LABEL[
                    rec.metric
                  ].toLowerCase()} 30 minutes of focused effort this week.`,
                  source: "ai_recommended",
                  confidencePct: 75,
                  history: [{ date: now.toISOString().slice(0, 10), value: 0 }],
                  createdAt: now.toISOString(),
                };
                onAdd(goal);
              }}
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Add goal
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}
