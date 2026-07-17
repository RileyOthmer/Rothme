import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import {
  ArrowRight,
  PlayCircle,
  Sparkles,
  TrendingUp,
  FileText,
  MessageSquare,
} from "lucide-react";

import { getProfile } from "@/lib/profile.functions";
import { AppHeader } from "@/components/layout/AppHeader";
import { DecisionCenter } from "@/features/decisions/DecisionCenter";
import { DashboardWidget } from "@/features/dashboard/DashboardWidget";
import { ProWelcome, ProChecklist } from "@/features/dashboard/ProWelcome";
import { QuickActions } from "@/components/assistant/QuickActions";
import { EmptyDataState, ZeroStatGrid } from "@/components/dashboard/EmptyDataState";
import { RecentActivity } from "@/features/activity/RecentActivity";
import { useHasConnections } from "@/hooks/use-has-connections";
import { useHasMetrics } from "@/hooks/use-has-metrics";
import { askAI } from "@/components/assistant/quick-actions";
import {
  loadDashboardPrefs,
  type DashboardPrefs,
  type WidgetId,
} from "@/features/dashboard/preferences";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Decisions — ROTHME" },
      {
        name: "description",
        content:
          "The AI Decision Center. A short, calm list of what to do today for your marketing — with the reason, the impact, and how confident ROTHME is.",
      },
    ],
  }),
  component: DashboardPage,
});

const DEFAULT_ORDER: WidgetId[] = [
  "ai", "analytics", "scheduling", "inbox", "accounts", "collab",
];

function DashboardPage() {
  const router = useRouter();
  const fetchProfile = useServerFn(getProfile);
  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: () => fetchProfile(),
  });
  const { hasConnections } = useHasConnections();
  const { hasMetrics } = useHasMetrics();

  const [prefs, setPrefs] = useState<DashboardPrefs | null>(null);
  useEffect(() => {
    setPrefs(loadDashboardPrefs());
  }, []);

  useEffect(() => {
    if (profileQuery.data && !profileQuery.data.onboarded_at) {
      router.navigate({ to: "/onboarding" });
    }
  }, [profileQuery.data, router]);

  const firstName = profileQuery.data?.full_name?.split(" ")[0] ?? "there";

  const order = prefs?.priority ?? DEFAULT_ORDER;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ProWelcome />
      <AppHeader />

      <main className="mx-auto max-w-5xl space-y-10 px-4 py-10 sm:px-6 sm:py-14">
        {/* Hero — AI CMO framing */}
        <section className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 sm:p-10">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-0 bg-gradient-to-br from-primary/[0.08] via-transparent to-fuchsia-500/[0.06]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl"
          />
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1 text-[11px] font-medium uppercase tracking-widest text-muted-foreground backdrop-blur">
              <Sparkles className="h-3 w-3 text-primary" />
              Your AI Chief Marketing Officer
            </div>
            <h1 className="mt-4 font-serif text-3xl leading-tight tracking-tight text-foreground sm:text-4xl">
              Welcome back, {firstName} <span aria-hidden>👋</span>
            </h1>
            <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
              Your AI Marketing Operating System is ready. Ask a question, launch a
              campaign, or let me tell you what to focus on today.
            </p>

            {/* Today's Executive Brief */}
            <div className="mt-8 rounded-2xl border border-border bg-background/70 p-5 backdrop-blur sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-lg border border-border bg-surface text-primary">
                    <TrendingUp className="h-3.5 w-3.5" />
                  </span>
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                      Today's Executive Brief
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {hasConnections && hasMetrics
                        ? "Here's what needs your attention."
                        : hasConnections
                          ? "Learning your baseline…"
                          : "Nothing to brief on yet."}
                    </p>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-[14px] leading-relaxed text-foreground/90">
                {hasConnections && hasMetrics
                  ? "I'll surface the moves that matter most as your real numbers come in — never sample data, never guesses."
                  : hasConnections
                    ? "Your accounts are connected. I'm waiting for your first synced metrics before I make any calls — no fabricated insights."
                    : "Connect a platform and I'll start briefing you every morning: what happened, why, and exactly what to do about it."}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                {!hasConnections ? (
                  <>
                    <Link
                      to="/settings/platforms"
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-foreground px-4 text-xs font-medium text-background transition-opacity hover:opacity-90"
                    >
                      Connect Your First Platform
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                    <button
                      type="button"
                      onClick={() =>
                        askAI({
                          prompt:
                            "Give me a 2-minute walkthrough of what you can do as my AI CMO — the categories of work, how I should think about you, and one example question I could ask right now.",
                          source: "hero:demo",
                        })
                      }
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-background px-4 text-xs font-medium text-foreground transition-colors hover:bg-surface-2"
                    >
                      <PlayCircle className="h-3.5 w-3.5" />
                      See what I can do
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        askAI({
                          prompt:
                            "Act as my Chief Marketing Officer. Look at everything connected to my account and tell me the single most important thing to optimize today. Explain what, why, the expected impact, and how confident you are.",
                          source: "hero:optimize",
                        })
                      }
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-foreground px-4 text-xs font-medium text-background transition-opacity hover:opacity-90"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      Optimize Now
                    </button>
                    <Link
                      to="/reports"
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-background px-4 text-xs font-medium text-foreground transition-colors hover:bg-surface-2"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      View Report
                    </Link>
                    <button
                      type="button"
                      onClick={() =>
                        askAI({
                          prompt:
                            "What should I ask you about my marketing right now? Give me 3 sharp questions I could ask based on what's connected to my account.",
                          source: "hero:ask",
                        })
                      }
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-background px-4 text-xs font-medium text-foreground transition-colors hover:bg-surface-2"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      Ask AI
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        <ProChecklist />

        <QuickActions />


        {/*
         * Zero-until-tracked policy: connecting an account creates a row, but
         * that alone doesn't mean we have real, ingested analytics yet. Until
         * the data engine actually has tracked metrics for this user, every
         * KPI, score, and insight on the dashboard MUST read as 0 / no data —
         * never seeded, never AI-fabricated. When real ingestion lands, flip
         * this gate to check for the presence of MetricSnapshots (or similar)
         * and only then render HealthScoreCard / DashboardInsightsSection.
         */}
        <ZeroStatGrid
          stats={[
            { label: "Followers" },
            { label: "Reach" },
            { label: "Engagement" },
            { label: "Posts" },
            { label: "Connected Platforms" },
            { label: "Campaigns" },
            { label: "Revenue", value: "$0" },
          ]}
        />
        {!hasConnections && (
          <EmptyDataState
            title="No marketing platforms connected."
            description="Connect a platform and your real followers, reach, engagement, and revenue will populate here. Until then, everything stays at zero — Rothme never shows sample data."
            ctaLabel="Connect Your First Platform"
            to="/settings/platforms"
          />
        )}

        <section aria-labelledby="widgets-heading" className="space-y-4">
          <h2 id="widgets-heading" className="sr-only">Shortcuts</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {order.map((id, i) => (
              <DashboardWidget key={id} widgetId={id} primary={i === 0} />
            ))}
          </div>
        </section>

        <RecentActivity />

        <DecisionCenter firstName={firstName} hasConnections={false} />
      </main>

      <Toaster position="bottom-right" />
    </div>
  );
}
