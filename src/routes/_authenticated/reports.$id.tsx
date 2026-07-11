import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Download, Mail, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { AppHeader } from "@/components/layout/AppHeader";
import { Toaster } from "@/components/ui/sonner";
import { getWeeklyReport } from "@/lib/reports.functions";
import type { ReportStatus, WeeklyReportPayload } from "@/lib/reports-mock";

export const Route = createFileRoute("/_authenticated/reports/$id")({
  head: () => ({
    meta: [
      { title: "Weekly report — Velora" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ReportDetailPage,
});

function formatWeek(weekStart: string) {
  const d = new Date(weekStart + "T00:00:00Z");
  return d.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

const statusLabel: Record<ReportStatus, string> = {
  healthy: "Strong",
  attention: "Steady",
  risk: "Needs attention",
};

const statusChipClass: Record<ReportStatus, string> = {
  healthy:
    "bg-[color-mix(in_oklab,var(--success)_14%,transparent)] text-[color:var(--success)]",
  attention:
    "bg-[color-mix(in_oklab,var(--warning)_18%,transparent)] text-[color-mix(in_oklab,var(--warning)_60%,var(--foreground))]",
  risk: "bg-[color-mix(in_oklab,var(--destructive)_14%,transparent)] text-[color:var(--destructive)]",
};

function ReportDetailPage() {
  const { id } = useParams({ from: "/_authenticated/reports/$id" });
  const fetchReport = useServerFn(getWeeklyReport);
  const { data, isLoading } = useQuery({
    queryKey: ["weekly_report", id],
    queryFn: () => fetchReport({ data: { id } }),
  });

  const payload = data?.payload as WeeklyReportPayload | undefined;

  const handleDownload = () => {
    // Native browser Save-as-PDF via print dialog. Print styles below strip
    // chrome and lay the report out cleanly on paper.
    window.print();
  };

  const handleEmail = () => {
    toast.message("Email delivery needs a verified sender domain", {
      description:
        "Set up your email domain in Settings, then this report will land in your inbox every Monday.",
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster />
      <div className="print:hidden">
        <AppHeader />
      </div>
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14 print:max-w-none print:px-0 print:py-0">
        <div className="print:hidden">
          <Link
            to="/reports"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> All reports
          </Link>
        </div>

        {isLoading ? (
          <p className="mt-6 text-sm text-muted-foreground">Loading…</p>
        ) : !data || !payload ? (
          <div className="mt-6 rounded-xl border border-border bg-surface p-8">
            <h1 className="text-lg font-semibold">Report not found</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              This report doesn't exist or was removed.
            </p>
          </div>
        ) : (
          <article className="report-print">
            {/* Header */}
            <header className="mt-4 flex items-baseline justify-between gap-4 border-b border-border pb-6">
              <div>
                <div className="eyebrow flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3" /> Weekly report
                </div>
                <h1 className="mt-2 font-serif text-3xl tracking-tight sm:text-4xl">
                  Week of {formatWeek(data.week_start)}
                </h1>
                <p className="mt-2 text-[15px] text-muted-foreground">
                  {payload.headline}
                </p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-semibold tabular-nums">
                  {payload.score}
                </div>
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Health score
                </div>
                <span
                  className={
                    "mt-2 inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium " +
                    statusChipClass[payload.status]
                  }
                >
                  {statusLabel[payload.status]}
                </span>
              </div>
            </header>

            {/* Action bar (screen only) */}
            <div className="mt-6 flex flex-wrap gap-2 print:hidden">
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-foreground shadow-xs transition-colors hover:bg-surface-2"
              >
                <Download className="h-3.5 w-3.5" />
                Download PDF
              </button>
              <button
                type="button"
                onClick={handleEmail}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-foreground shadow-xs transition-colors hover:bg-surface-2"
              >
                <Mail className="h-3.5 w-3.5" />
                Email me this report
              </button>
            </div>

            <Section title="Business summary">
              <p className="text-[15px] leading-relaxed">{payload.businessSummary}</p>
            </Section>

            <TwoColumn>
              <Section title="Wins" tone="good">
                <BulletList items={payload.wins} />
              </Section>
              <Section title="Problems" tone="warn">
                <BulletList items={payload.problems} />
              </Section>
            </TwoColumn>

            <Section title="Recommendations">
              <ol className="space-y-4">
                {payload.recommendations.map((r, i) => (
                  <li
                    key={i}
                    className="rounded-lg border border-border bg-surface-2/40 p-4 print:bg-transparent"
                  >
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-medium text-muted-foreground tabular-nums">
                        {i + 1}.
                      </span>
                      <div className="text-[15px] font-medium">{r.title}</div>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{r.why}</p>
                    <p className="mt-2 text-sm">
                      <span className="font-medium">Do this: </span>
                      {r.action}
                    </p>
                  </li>
                ))}
              </ol>
            </Section>

            <TwoColumn>
              <Section title="Goals for next week">
                <BulletList items={payload.goals} />
              </Section>
              <Section title="Opportunities">
                <BulletList items={payload.opportunities} />
              </Section>
            </TwoColumn>

            <Section title="Channel by channel">
              <dl className="divide-y divide-border">
                <ChannelRow label="Revenue" body={payload.channelSummaries.revenue} />
                <ChannelRow label="Advertising" body={payload.channelSummaries.advertising} />
                <ChannelRow label="Search (SEO)" body={payload.channelSummaries.seo} />
                <ChannelRow label="Email" body={payload.channelSummaries.email} />
                <ChannelRow label="Social" body={payload.channelSummaries.social} />
              </dl>
            </Section>

            <Section title="Next week's priorities" emphasis>
              <ol className="space-y-4">
                {payload.nextWeekPriorities.map((p, i) => (
                  <li key={i} className="rounded-lg border border-border p-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-medium text-muted-foreground tabular-nums">
                        {i + 1}.
                      </span>
                      <div className="text-[15px] font-medium">{p.priority}</div>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{p.reason}</p>
                    <p className="mt-2 text-sm">
                      <span className="font-medium">Expected result: </span>
                      {p.estimatedResult}
                    </p>
                  </li>
                ))}
              </ol>
            </Section>

            <footer className="mt-10 border-t border-border pt-6 text-xs text-muted-foreground">
              Generated by Velora — your AI marketing strategist. Numbers are drawn from your connected platforms.
            </footer>
          </article>
        )}
      </main>
    </div>
  );
}

function Section({
  title,
  tone,
  emphasis,
  children,
}: {
  title: string;
  tone?: "good" | "warn";
  emphasis?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      className={
        "mt-8 rounded-xl border border-border p-6 shadow-sm print:mt-6 print:shadow-none " +
        (emphasis ? "bg-surface-2/60 print:bg-transparent" : "bg-surface print:bg-transparent")
      }
    >
      <h2
        className={
          "eyebrow mb-3 " +
          (tone === "good"
            ? "text-[color:var(--success)]"
            : tone === "warn"
              ? "text-[color-mix(in_oklab,var(--warning)_60%,var(--foreground))]"
              : "")
        }
      >
        {title}
      </h2>
      <div className="text-foreground">{children}</div>
    </section>
  );
}

function TwoColumn({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 print:grid-cols-2 print:gap-4">
      {children}
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((it, i) => (
        <li key={i} className="flex gap-2 text-sm">
          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-foreground/40" />
          <span className="leading-relaxed">{it}</span>
        </li>
      ))}
    </ul>
  );
}

function ChannelRow({ label, body }: { label: string; body: string }) {
  return (
    <div className="grid gap-1 py-3 sm:grid-cols-[140px_1fr] sm:gap-4">
      <dt className="text-sm font-medium">{label}</dt>
      <dd className="text-sm text-muted-foreground">{body}</dd>
    </div>
  );
}
