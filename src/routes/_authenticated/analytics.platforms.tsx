import { createFileRoute } from "@tanstack/react-router";
import { ComingSoonHub } from "@/features/analytics/ComingSoonHub";

export const Route = createFileRoute("/_authenticated/analytics/platforms")({
  head: () => ({ meta: [{ title: "Platform Analytics — ROTHME" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ComingSoonHub
      title="Platform Analytics" phase={2}
      subtitle="Native analytics for every connected platform, rendered from your installed plugins' KPI metadata."
      kpis={["Followers", "Reach", "Impressions", "Engagement rate", "Profile visits", "Posts", "Best posting time", "Content-type mix"]}
      charts={["Line & Spline (trends)", "Stacked area (mix over time)", "Horizontal bar (top posts)", "Donut (content-type share)", "Heatmap (posting time)"]}
    />
  ),
});
