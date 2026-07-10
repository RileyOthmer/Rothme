import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";

import { AppHeader } from "@/components/layout/AppHeader";
import { getWeeklyReport } from "@/lib/reports.functions";
import type { WeeklyReportPayload } from "@/lib/reports-mock";

export const Route = createFileRoute("/_authenticated/reports/$id")({
  head: () => ({
    meta: [
      { title: "Weekly report — Northstar" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ReportDetailPage,
});

function formatWeek(weekStart: string) {
  const d = new Date(weekStart + "T00:00:00Z");
  return d.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
}

function ReportDetailPage() {
  const { id } = useParams({ from: "/_authenticated/reports/$id" });
  const fetchReport = useServerFn(getWeeklyReport);
  const { data, isLoading } = useQuery({
    queryKey: ["weekly_report", id],
    queryFn: () => fetchReport({ data: { id } }),
  });

  const payload = data?.payload as WeeklyReportPayload | undefined;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <Link to="/reports" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> All reports
        </Link>

        {isLoading ? (
          <p className="mt-6 text-sm text-muted-foreground">Loading…</p>
        ) : !data || !payload ? (
          <div className="mt-6 rounded-xl border border-border bg-surface p-8">
            <h1 className="text-lg font-semibold">Report not found</h1>
            <p className="mt-1 text-sm text-muted-foreground">This report doesn't exist or was removed.</p>
          </div>
        ) : (
          <>
            <div className="mt-4 flex items-baseline justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">Week of {formatWeek(data.week_start)}</h1>
                <p className="mt-1 text-sm text-muted-foreground">{payload.headline}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-semibold">{payload.score}</div>
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Health score</div>
              </div>
            </div>

            <section className="mt-8 rounded-xl border border-border bg-surface p-6 shadow-sm">
              <div className="eyebrow mb-2">Summary</div>
              <p className="text-sm">{payload.summary}</p>
            </section>

            <section className="mt-6 rounded-xl border border-border bg-surface p-6 shadow-sm">
              <div className="eyebrow mb-3">What changed</div>
              <ul className="space-y-3">
                {payload.highlights.map((h, i) => (
                  <li key={i}>
                    <div className="text-sm font-medium">{h.title}</div>
                    <div className="text-sm text-muted-foreground">{h.detail}</div>
                  </li>
                ))}
              </ul>
            </section>

            <section className="mt-6 rounded-xl border border-border bg-surface p-6 shadow-sm">
              <div className="eyebrow mb-3">Recommended actions</div>
              <ul className="space-y-4">
                {payload.recommendations.map((r, i) => (
                  <li key={i} className="rounded-lg border border-border p-4">
                    <div className="text-sm font-medium">{r.title}</div>
                    <div className="mt-1 text-sm text-muted-foreground">{r.why}</div>
                    <div className="mt-2 text-sm">
                      <span className="font-medium">Do this:</span> {r.action}
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section className="mt-6 rounded-xl border border-border bg-surface p-6 shadow-sm">
              <div className="eyebrow mb-2">Business impact</div>
              <p className="text-sm">{payload.impact}</p>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
