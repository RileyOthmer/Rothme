import { createFileRoute } from "@tanstack/react-router";
import { ComingSoonHub } from "@/features/analytics/ComingSoonHub";

export const Route = createFileRoute("/_authenticated/analytics/forecasting")({
  head: () => ({ meta: [{ title: "Forecasting — ROTHME" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ComingSoonHub
      title="Forecasting" phase={4}
      subtitle="30-, 60-, and 90-day projections for every KPI, with confidence bands."
      kpis={["Projected followers", "Projected reach", "Projected revenue", "Projected ROAS", "Goal-attainment probability"]}
      charts={["Line + confidence band", "Scenario compare (best/expected/worst)", "Gauge (goal attainment)"]}
    />
  ),
});
