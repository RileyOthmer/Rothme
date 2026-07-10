import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { DashboardData } from "@/lib/dashboard-mock";
import { VerdictPill } from "./StatusPill";
import { PlainTerm } from "./PlainTerm";

export function PerformanceSummary({ rows }: { rows: DashboardData["performance"] }) {
  const [showAdv, setShowAdv] = useState(false);

  return (
    <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
      <div className="eyebrow mb-4">Performance summary</div>

      <ul className="divide-y divide-border">
        {rows.map((row) => (
          <li key={row.area} className="py-4 first:pt-0 last:pb-0">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">{row.area}</span>
                  <VerdictPill verdict={row.verdict} />
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
                  {row.sentence}
                </p>
              </div>
            </div>
            {showAdv ? (
              <dl className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {row.advanced.map((m) => (
                  <div
                    key={m.label}
                    className="rounded-md border border-border bg-surface-2 px-3 py-2"
                  >
                    <dt className="text-[11px] text-muted-foreground">
                      <PlainTerm term={m.label}>{m.plain}</PlainTerm>
                    </dt>
                    <dd className="mt-0.5 font-mono text-sm text-foreground">{m.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </li>
        ))}
      </ul>

      <div className="mt-4 border-t border-border pt-4">
        <button
          type="button"
          onClick={() => setShowAdv((v) => !v)}
          className="eyebrow inline-flex items-center gap-1 transition-colors hover:text-foreground"
        >
          {showAdv ? "Hide numbers" : "Show numbers"}
          <ChevronDown
            className={"h-3 w-3 transition-transform " + (showAdv ? "rotate-180" : "")}
          />
        </button>
      </div>
    </section>
  );
}
