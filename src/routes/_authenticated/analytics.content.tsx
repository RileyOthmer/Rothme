import { createFileRoute } from "@tanstack/react-router";
import { ComingSoonHub } from "@/features/analytics/ComingSoonHub";

export const Route = createFileRoute("/_authenticated/analytics/content")({
  head: () => ({ meta: [{ title: "Content Analytics — Velora" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ComingSoonHub
      title="Content Analytics" phase={2}
      subtitle="Every post, thumbnail, caption, and metric — sortable, filterable, virtualized for millions of rows."
      kpis={["Reach", "Engagement", "Likes", "Comments", "Shares", "Saves", "Watch time", "Retention", "CTR", "Revenue"]}
      charts={["Post-level virtualized table", "Treemap (content mix)", "Scatter (reach vs engagement)", "Calendar heatmap (posting cadence)"]}
    />
  ),
});
