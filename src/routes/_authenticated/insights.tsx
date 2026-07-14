import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { AppHeader } from "@/components/layout/AppHeader";
import {
  getOnboardingInsights,
  type OnboardingInsights,
} from "@/lib/onboarding-analytics.functions";

export const Route = createFileRoute("/_authenticated/insights")({
  head: () => ({
    meta: [
      { title: "Product insights — ROTHME" },
      {
        name: "description",
        content:
          "Anonymous onboarding signal — what people ask for, where they drop off, how ROTHME should prioritize next.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: InsightsPage,
});

function InsightsPage() {
  const fetchInsights = useServerFn(getOnboardingInsights);
  const q = useQuery({
    queryKey: ["onboarding-insights"],
    queryFn: () => fetchInsights(),
    refetchOnWindowFocus: false,
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <main className="mx-auto max-w-5xl space-y-10 px-4 py-10 sm:px-6 sm:py-14">
        <header>
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Product insights
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            What people tell us during onboarding
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Anonymous. No names, no emails — just the signal we need to decide what to build next.
          </p>
        </header>

        {q.isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading insights…
          </div>
        )}
        {q.isError && (
          <p className="text-sm text-destructive">
            {q.error instanceof Error ? q.error.message : "Could not load insights."}
          </p>
        )}
        {q.data && <InsightsBody data={q.data} />}
      </main>
    </div>
  );
}

function InsightsBody({ data }: { data: OnboardingInsights }) {
  const pct = (n: number) => `${Math.round(n * 100)}%`;
  return (
    <>
      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Onboardings started" value={data.totalStarts.toLocaleString()} />
        <StatCard label="Completed" value={data.totalCompleted.toLocaleString()} />
        <StatCard label="Completion rate" value={pct(data.completionRate)} />
      </section>

      <Grid>
        <RankCard title="Most common user types" rows={data.userTypes} />
        <RankCard title="Most requested AI features" rows={data.aiFeatures} />
        <RankCard title="Biggest customer pain points" rows={data.frustrations} />
        <RankCard title="Most-used platforms" rows={data.platforms} />
        <RankCard title="Most-connected platforms" rows={data.connectedPlatforms} />
        <RankCard title="Top goals" rows={data.goals} />
        <RankCard title="Posting cadence" rows={data.cadence} />
        <RankCard title="Device" rows={data.devices} />
        <RankCard title="Country" rows={data.countries} />
        <RankCard title="Referral source" rows={data.referrals} />
      </Grid>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-base font-semibold">Drop-off per onboarding step</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          How many people who saw each step moved on.
        </p>
        <div className="mt-5 space-y-3">
          {data.dropOffByStep.length === 0 && (
            <p className="text-sm text-muted-foreground">No step-level data yet.</p>
          )}
          {data.dropOffByStep.map((s) => (
            <div key={s.stepId} className="grid grid-cols-[100px_1fr_auto] items-center gap-3">
              <div className="text-sm font-medium capitalize">{s.stepId}</div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{
                    width: `${s.views > 0 ? Math.round((s.completions / s.views) * 100) : 0}%`,
                  }}
                />
              </div>
              <div className="text-xs tabular-nums text-muted-foreground">
                {s.completions}/{s.views} · {pct(s.dropRate)} drop
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-base font-semibold">Growth over time</h2>
        <p className="mt-1 text-sm text-muted-foreground">Last 30 days.</p>
        <GrowthChart rows={data.growth} />
      </section>
    </>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <section className="grid gap-4 sm:grid-cols-2">{children}</section>;
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-2 text-3xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function RankCard({
  title,
  rows,
}: {
  title: string;
  rows: Array<{ label: string; count: number }>;
}) {
  const max = rows[0]?.count ?? 0;
  const top = rows.slice(0, 8);
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold">{title}</h3>
      {top.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">No responses yet.</p>
      ) : (
        <ul className="mt-4 space-y-2.5">
          {top.map((r) => (
            <li key={r.label} className="grid grid-cols-[1fr_auto] items-center gap-3">
              <div className="min-w-0">
                <div className="truncate text-sm">{r.label}</div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary/70"
                    style={{ width: max > 0 ? `${(r.count / max) * 100}%` : "0%" }}
                  />
                </div>
              </div>
              <div className="text-xs tabular-nums text-muted-foreground">{r.count}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function GrowthChart({
  rows,
}: {
  rows: Array<{ day: string; starts: number; completions: number }>;
}) {
  const max = Math.max(1, ...rows.map((r) => Math.max(r.starts, r.completions)));
  return (
    <div className="mt-4">
      <div className="flex h-40 items-end gap-1">
        {rows.map((r) => (
          <div key={r.day} className="group relative flex flex-1 flex-col items-center gap-0.5">
            <div
              className="w-full rounded-t bg-primary/30"
              style={{ height: `${(r.starts / max) * 100}%` }}
              title={`${r.day} · ${r.starts} started`}
            />
            <div
              className="w-full rounded-t bg-primary"
              style={{ height: `${(r.completions / max) * 100}%` }}
              title={`${r.day} · ${r.completions} completed`}
            />
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-primary/30" /> Started
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-primary" /> Completed
        </span>
      </div>
    </div>
  );
}
