import { Sparkles } from "lucide-react";
import type { DashboardData } from "@/lib/dashboard-mock";
import { toast } from "sonner";

export function AISummary({ data }: { data: DashboardData["aiSummary"] }) {
  return (
    <section className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-b from-surface to-background p-5 sm:p-7">
      <div className="mb-4 flex items-center gap-2">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-primary/15 text-primary">
          <Sparkles className="h-3.5 w-3.5" />
        </span>
        <span className="eyebrow">Your daily briefing</span>
      </div>

      <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        {data.greeting}
      </h1>

      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground sm:text-base">
        {data.paragraph}
      </p>

      <div className="mt-6">
        <div className="eyebrow mb-3">Today I recommend</div>
        <ul className="space-y-3">
          {data.recommendations.map((r) => (
            <li
              key={r.id}
              className="rounded-lg border border-border bg-surface p-4 sm:flex sm:items-start sm:justify-between sm:gap-4"
            >
              <p className="text-sm leading-relaxed text-foreground sm:flex-1 sm:text-[15px]">
                {r.text}
              </p>
              <div className="mt-3 sm:mt-0 sm:shrink-0">
                <button
                  type="button"
                  onClick={() => toast(`Starting: ${r.cta.toLowerCase()}`)}
                  className="inline-flex h-8 items-center justify-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:opacity-90"
                >
                  {r.cta}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
