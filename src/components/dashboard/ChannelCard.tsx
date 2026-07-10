import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { PerformanceRow } from "@/lib/dashboard-mock";
import { VerdictPill } from "./StatusPill";
import { PlainTerm } from "./PlainTerm";

const TITLES: Record<PerformanceRow["area"], string> = {
  Ads: "Advertising performance",
  Posts: "Social performance",
  Emails: "Email performance",
};

export function ChannelCard({ row }: { row: PerformanceRow }) {
  const [showAdv, setShowAdv] = useState(false);

  return (
    <section className="rounded-xl border border-border bg-surface p-6 shadow-sm sm:p-7">
      <div className="mb-3 flex items-center justify-between gap-4">
        <span className="eyebrow">{TITLES[row.area]}</span>
        <VerdictPill verdict={row.verdict} />
      </div>

      <p className="text-[15px] leading-relaxed text-foreground sm:text-base">
        {row.sentence}
      </p>

      {showAdv ? (
        <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 animate-in fade-in duration-150">
          {row.advanced.map((m) => (
            <div
              key={m.label}
              className="rounded-lg border border-border bg-surface-2 px-3 py-2"
            >
              <dt className="text-[11px] text-muted-foreground">
                <PlainTerm term={m.label}>{m.plain}</PlainTerm>
              </dt>
              <dd className="mt-0.5 font-mono text-sm text-foreground">{m.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      <div className="mt-4 border-t border-border pt-3">
        <button
          type="button"
          onClick={() => setShowAdv((v) => !v)}
          className="eyebrow inline-flex items-center gap-1 transition-colors hover:text-foreground"
        >
          {showAdv ? "Hide numbers" : "Show numbers"}
          <ChevronDown
            className={"h-3 w-3 transition-transform duration-150 " + (showAdv ? "rotate-180" : "")}
          />
        </button>
      </div>
    </section>
  );
}
