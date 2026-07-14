import { createFileRoute } from "@tanstack/react-router";
import { ComingSoonHub } from "@/features/analytics/ComingSoonHub";

export const Route = createFileRoute("/_authenticated/analytics/seo")({
  head: () => ({ meta: [{ title: "SEO Analytics — ROTHME" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ComingSoonHub
      title="SEO Analytics" phase={5}
      subtitle="Keywords, rankings, backlinks, and Search Console performance in one place."
      kpis={["Impressions", "Clicks", "CTR", "Average position", "Ranking keywords", "Backlinks", "Referring domains", "Top pages"]}
      charts={["Line (position over time)", "Bar (top keywords)", "Table (backlink profile)", "Treemap (topic clusters)"]}
    />
  ),
});
