import { useEffect, useState } from "react";
import { Info } from "lucide-react";
import type { DashboardData } from "@/lib/dashboard-mock";

function greetingForHour(h: number, name: string) {
  const tod = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  return name && name !== "there" ? `${tod}, ${name}.` : `${tod}.`;
}

export function AISummary({
  data,
  name = "there",
  sources,
}: {
  data: DashboardData["aiSummary"];
  name?: string;
  sources?: string[];
}) {
  const [greeting, setGreeting] = useState<string>("Hello.");
  useEffect(() => {
    setGreeting(greetingForHour(new Date().getHours(), name));
  }, [name]);

  return (
    <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-9">
      <div className="mb-5 flex items-center gap-2">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-border bg-surface-2 text-foreground/70">
          <Info className="h-3.5 w-3.5" />
        </span>
        <span className="eyebrow">What happened this period</span>
      </div>

      <div className="space-y-3 font-serif text-[26px] leading-[1.25] tracking-tight text-foreground sm:text-[32px]">
        <p>{greeting}</p>
        <p>{data.headline}</p>
        <p className="text-muted-foreground">{data.body}</p>
      </div>

      {data.recommendations.length > 0 && (
        <div className="mt-8">
          <p className="text-[15px] font-medium text-foreground">Observations</p>
          <ul className="mt-3 space-y-2.5">
            {data.recommendations.map((r) => (
              <li key={r.id} className="flex items-start gap-3">
                <span
                  aria-hidden
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/60"
                />
                <p className="flex-1 text-[15px] leading-relaxed text-foreground">
                  {r.text}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {sources && sources.length > 0 && (
        <p className="mt-6 text-xs text-muted-foreground">
          Data sources: {sources.join(" · ")}
        </p>
      )}
    </section>
  );
}
