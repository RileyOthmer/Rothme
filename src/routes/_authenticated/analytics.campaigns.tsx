import { createFileRoute } from "@tanstack/react-router";
import { ComingSoonHub } from "@/features/analytics/ComingSoonHub";

export const Route = createFileRoute("/_authenticated/analytics/campaigns")({
  head: () => ({ meta: [{ title: "Campaign Analytics — ROTHME" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ComingSoonHub
      title="Campaign Analytics" phase={2}
      subtitle="Every campaign, every objective, every platform — in one comparable view."
      kpis={["Spend", "Impressions", "Clicks", "CTR", "CPC", "CPM", "CPA", "ROAS", "Conversions", "Revenue"]}
      charts={["Line (spend vs revenue)", "Bar (per-campaign)", "Funnel (impression → conversion)", "Scorecards", "Table (drillable)"]}
    />
  ),
});
