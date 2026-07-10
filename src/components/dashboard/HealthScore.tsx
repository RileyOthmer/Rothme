import type { DashboardData } from "@/lib/dashboard-mock";
import { AskAboutButton } from "@/components/assistant/AskAboutButton";
import { HealthPill } from "./StatusPill";
import { PlainTerm } from "./PlainTerm";

export function HealthScore({
  data,
  onAction,
}: {
  data: DashboardData["health"];
  onAction: () => void;
}) {
  return (
    <section className="rounded-xl border border-border bg-surface p-6 shadow-sm sm:p-7">
      <div className="mb-4 flex items-center justify-between gap-4">
        <span className="eyebrow">Marketing health</span>
        <div className="flex items-center gap-2">
          <AskAboutButton
            threadKey="health"
            seed="What does my marketing health score actually mean, and what's dragging it down?"
          />
          <HealthPill status={data.status} />
        </div>
      </div>

      <h2 className="text-xl font-medium leading-snug tracking-tight text-foreground sm:text-[22px]">
        {data.what}
      </h2>
      <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{data.why}</p>
      <p className="mt-4 text-[15px] leading-relaxed text-foreground/90">
        <span className="eyebrow mr-2 align-middle">What to do</span>
        <span className="align-middle">{data.todo}</span>
      </p>

      <div className="mt-6">
        <button
          type="button"
          onClick={onAction}
          className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs transition-all duration-150 hover:opacity-90"
        >
          Show today's task
        </button>
      </div>

      <details className="group mt-6 border-t border-border pt-4">
        <summary className="eyebrow inline-flex cursor-pointer list-none items-center gap-1 transition-colors hover:text-foreground [&::-webkit-details-marker]:hidden">
          Show advanced
        </summary>
        <div className="mt-3 text-sm text-muted-foreground">
          <PlainTerm term="Marketing health score (0–100)">Health score</PlainTerm>:{" "}
          <span className="font-mono text-foreground">{data.score} / 100</span>
        </div>
      </details>
    </section>
  );
}
