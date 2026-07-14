import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { FileText } from "lucide-react";

import { AppHeader } from "@/components/layout/AppHeader";
import { listWeeklyReports } from "@/lib/reports.functions";
import type { WeeklyReportPayload } from "@/lib/reports-mock";

export const Route = createFileRoute("/_authenticated/reports")({
  head: () => ({
    meta: [
      { title: "Weekly reports — ROTHME" },
      {
        name: "description",
        content: "Your weekly plain-English marketing report — what happened, why, and what to do next.",
      },
    ],
  }),
  component: ReportsPage,
});

function formatWeek(weekStart: string) {
  const d = new Date(weekStart + "T00:00:00Z");
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

function ReportsPage() {
  const fetchReports = useServerFn(listWeeklyReports);
  const { data, isLoading } = useQuery({
    queryKey: ["weekly_reports"],
    queryFn: () => fetchReports(),
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Weekly reports</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            A short, plain-English summary of your marketing every week.
          </p>
        </div>

        {isLoading ? (
          <div className="rounded-xl border border-border bg-surface p-8 text-sm text-muted-foreground">
            Loading your reports…
          </div>
        ) : (
          <ul className="space-y-3">
            {(data ?? []).map((r) => {
              const payload = r.payload as WeeklyReportPayload;
              return (
                <li key={r.id}>
                  <Link
                    to="/reports/$id"
                    params={{ id: r.id }}
                    className="flex items-start gap-4 rounded-xl border border-border bg-surface p-5 shadow-sm transition-colors hover:bg-surface-2"
                  >
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-surface-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Week of {formatWeek(r.week_start)}</span>
                        <span
                          className={
                            "rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide " +
                            (payload.status === "healthy"
                              ? "bg-emerald-50 text-emerald-700"
                              : payload.status === "attention"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-red-50 text-red-700")
                          }
                        >
                          {payload.status}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{payload.businessSummary ?? payload.summary ?? ""}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-lg font-semibold">{payload.score}</div>
                      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">score</div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
