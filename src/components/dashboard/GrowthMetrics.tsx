import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import type { GrowthMetric } from "@/lib/dashboard-mock";
import { PlainTerm } from "./PlainTerm";

export function GrowthMetrics({ metrics }: { metrics: GrowthMetric[] }) {
  return (
    <section className="rounded-xl border border-border bg-surface p-6 shadow-sm sm:p-7">
      <div className="mb-5 flex items-center justify-between">
        <span className="eyebrow">Recent growth</span>
        <span className="text-xs text-muted-foreground">This week vs last week</span>
      </div>

      <ul className="grid grid-cols-1 divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {metrics.map((m) => {
          const Icon =
            m.direction === "up" ? ArrowUpRight : m.direction === "down" ? ArrowDownRight : Minus;
          const tone =
            m.direction === "up"
              ? "text-success"
              : m.direction === "down"
                ? "text-danger"
                : "text-muted-foreground";
          return (
            <li key={m.id} className="py-4 first:pt-0 last:pb-0 sm:px-6 sm:first:pl-0 sm:last:pr-0 sm:py-0">
              <div className="text-xs font-medium text-muted-foreground">
                <PlainTerm term={m.label}>{m.plain}</PlainTerm>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-medium tracking-tight text-foreground sm:text-[26px]">
                  {m.value}
                </span>
              </div>
              <div className={"mt-1.5 inline-flex items-center gap-1 text-xs font-medium " + tone}>
                <Icon className="h-3 w-3" />
                {m.deltaLabel}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
