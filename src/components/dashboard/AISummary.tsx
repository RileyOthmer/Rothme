import { Sparkles } from "lucide-react";
import type { DashboardData } from "@/lib/dashboard-mock";
import { toast } from "sonner";

export function AISummary({ data }: { data: DashboardData["aiSummary"] }) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-9">
      <div className="mb-5 flex items-center gap-2">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-border bg-surface-2 text-foreground/70">
          <Sparkles className="h-3.5 w-3.5" />
        </span>
        <span className="eyebrow">Your daily briefing</span>
      </div>

      <h1 className="font-serif text-[32px] leading-[1.1] tracking-tight text-foreground sm:text-[40px]">
        {data.greeting}
      </h1>

      <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted-foreground sm:text-base">
        {data.paragraph}
      </p>

      <div className="mt-8">
        <div className="eyebrow mb-2">Today I recommend</div>
        <ul className="divide-y divide-border">
          {data.recommendations.map((r) => (
            <li
              key={r.id}
              className="py-4 first:pt-3 last:pb-0 sm:flex sm:items-start sm:justify-between sm:gap-6"
            >
              <p className="text-[15px] leading-relaxed text-foreground sm:flex-1">
                {r.text}
              </p>
              <div className="mt-3 sm:mt-0 sm:shrink-0">
                <button
                  type="button"
                  onClick={() => toast(`Starting: ${r.cta.toLowerCase()}`)}
                  className="inline-flex h-8 items-center justify-center rounded-lg border border-border-strong bg-surface px-3 text-xs font-medium text-foreground shadow-xs transition-all duration-150 hover:bg-surface-2"
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
