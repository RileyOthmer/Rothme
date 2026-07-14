import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/layout/AppHeader";
import { AnalyticsHubNav } from "@/features/analytics/AnalyticsHubNav";
import { InsightsPanel } from "@/features/insights/InsightsPanel";

export const Route = createFileRoute("/_authenticated/analytics/ai-insights")({
  head: () => ({
    meta: [
      { title: "AI Insights — Velora" },
      {
        name: "description",
        content:
          "Velora reads every metric across your platforms and explains what happened, why, and what to do next — in plain English, with confidence.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AiInsightsPage,
});

function AiInsightsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Analytics Center
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            AI Insights
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            A strategist reading every KPI: what happened, why, what to do next — with a
            confidence score you can trust.
          </p>
        </div>

        <AnalyticsHubNav />

        <InsightsPanel />
      </main>
    </div>
  );
}
