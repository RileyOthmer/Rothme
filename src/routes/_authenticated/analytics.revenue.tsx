import { createFileRoute } from "@tanstack/react-router";
import { ComingSoonHub } from "@/features/analytics/ComingSoonHub";

export const Route = createFileRoute("/_authenticated/analytics/revenue")({
  head: () => ({ meta: [{ title: "Revenue Analytics — Velora" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ComingSoonHub
      title="Revenue Analytics" phase={2}
      subtitle="Attribution from post → click → conversion → revenue, unified across Shopify, WooCommerce, HubSpot, and Salesforce."
      kpis={["Revenue", "Orders", "AOV", "Conversion rate", "LTV", "CAC", "ROI", "Attributed revenue by channel"]}
      charts={["Waterfall (attribution)", "Stacked area (revenue by source)", "Bar (top products)", "Cohort (retention)", "Table (orders)"]}
    />
  ),
});
