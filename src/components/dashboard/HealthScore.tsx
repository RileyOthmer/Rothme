import type { DashboardData } from "@/lib/dashboard-mock";
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
    <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
      <div className="mb-3 flex items-center justify-between gap-4">
        <span className="eyebrow">Marketing health</span>
        <HealthPill status={data.status} />
      </div>

      <h2 className="text-xl font-semibold leading-snug text-foreground sm:text-2xl">
        {data.what}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
        {data.why}
      </p>
      <p className="mt-3 text-sm text-foreground/90 sm:text-[15px]">
        <span className="eyebrow mr-2 align-middle">What to do</span>
        <span className="align-middle">{data.todo}</span>
      </p>

      <div className="mt-5">
        <button
          type="button"
          onClick={onAction}
          className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
        >
          Show today's task
        </button>
      </div>

      <details className="group mt-5 border-t border-border pt-4">
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
