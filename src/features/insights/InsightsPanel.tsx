import { useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { InsightCard } from "./InsightCard";
import { SEED_INSIGHTS } from "./seed";
import type { Insight, InsightCategory } from "./types";

type Filter = "all" | InsightCategory;

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All insights" },
  { id: "engagement", label: "Engagement" },
  { id: "content", label: "Content" },
  { id: "platform", label: "Platform" },
  { id: "audience", label: "Audience" },
  { id: "advertising", label: "Advertising" },
];

export function InsightsPanel({ insights = SEED_INSIGHTS }: { insights?: Insight[] }) {
  const [filter, setFilter] = useState<Filter>("all");

  const visible = useMemo(
    () => (filter === "all" ? insights : insights.filter((i) => i.category === filter)),
    [filter, insights],
  );

  const avgConfidence = useMemo(
    () =>
      insights.length
        ? Math.round(insights.reduce((s, i) => s + i.confidencePct, 0) / insights.length)
        : 0,
    [insights],
  );

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-transparent to-transparent p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              <Sparkles className="h-3 w-3" />
              AI Insights
            </div>
            <h2 className="mt-2 text-lg font-semibold tracking-tight">
              {insights.length} things worth knowing this week.
            </h2>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              Velora read every metric across your platforms. Here's what changed,
              why it changed, and what to do about it — in plain English.
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Avg confidence
            </p>
            <p className="text-2xl font-semibold tabular-nums">{avgConfidence}%</p>
          </div>
        </div>
      </div>

      <div className="scrollbar-none -mx-1 flex gap-1.5 overflow-x-auto px-1">
        {FILTERS.map((f) => {
          const active = filter === f.id;
          const count =
            f.id === "all" ? insights.length : insights.filter((i) => i.category === f.id).length;
          if (f.id !== "all" && count === 0) return null;
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              {f.label}
              <span className={cn("ml-1.5 tabular-nums", active ? "opacity-80" : "opacity-60")}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center">
          <p className="text-sm text-muted-foreground">
            No insights in this category right now. Velora will surface something the moment it matters.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {visible.map((i) => (
            <InsightCard key={i.id} insight={i} />
          ))}
        </div>
      )}
    </section>
  );
}
