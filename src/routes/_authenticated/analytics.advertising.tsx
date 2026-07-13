import { createFileRoute } from "@tanstack/react-router";
import { ComingSoonHub } from "@/features/analytics/ComingSoonHub";

export const Route = createFileRoute("/_authenticated/analytics/advertising")({
  head: () => ({ meta: [{ title: "Advertising Analytics — Velora" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ComingSoonHub
      title="Advertising Analytics" phase={2}
      subtitle="Spend, reach, and performance across Meta, Google, TikTok, LinkedIn — normalized into one comparable view."
      kpis={["Spend", "Impressions", "Clicks", "CTR", "CPM", "CPC", "CPA", "ROAS", "Revenue", "Attribution"]}
      charts={["Stacked bar (spend by channel)", "Line (ROAS trend)", "Funnel (attribution)", "Scatter (CPA vs ROAS)", "Table (per-ad drilldown)"]}
    />
  ),
});
