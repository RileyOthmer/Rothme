import { createFileRoute } from "@tanstack/react-router";
import { ComingSoonHub } from "@/features/analytics/ComingSoonHub";

export const Route = createFileRoute("/_authenticated/analytics/ai-insights")({
  head: () => ({ meta: [{ title: "AI Insights — Velora" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ComingSoonHub
      title="AI Insights" phase={4}
      subtitle="A strategist reading every KPI: what happened, why, what to do next, with a confidence score."
      kpis={["Auto-detected performance changes", "Audience shifts", "Content winners & losers", "Best posting time", "Budget recommendations"]}
      charts={["Insight cards with evidence", "Trend annotations on every chart", "Weekly narrative digest", "Action queue"]}
    />
  ),
});
