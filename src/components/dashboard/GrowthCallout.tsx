import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import type { DashboardData } from "@/lib/dashboard-mock";
import { ExplainButton } from "./ExplainButton";

export function GrowthCallout({ data }: { data: DashboardData["growth"] }) {
  const Icon = data.delta > 0 ? ArrowUpRight : data.delta < 0 ? ArrowDownRight : Minus;
  const tone =
    data.delta > 0 ? "text-success" : data.delta < 0 ? "text-danger" : "text-muted-foreground";

  return (
    <section className="rounded-xl border border-border bg-surface p-6 shadow-sm sm:p-7">
      <div className="mb-4 flex items-center justify-between gap-4">
        <span className="eyebrow">Recent growth</span>
        <span
          className={
            "inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2.5 py-0.5 text-[11px] font-medium shadow-xs " +
            tone
          }
        >
          <Icon className="h-3 w-3" />
          {data.delta > 0 ? `+${data.delta}` : data.delta}
        </span>
      </div>

      <p className="text-xl font-medium leading-snug tracking-tight text-foreground sm:text-[22px]">
        {data.what}
      </p>

      <div className="mt-4">
        <ExplainButton label="Show me why" openLabel="Hide">
          <ul className="list-disc space-y-1 pl-4">
            {data.why.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </ExplainButton>
      </div>
    </section>
  );
}
