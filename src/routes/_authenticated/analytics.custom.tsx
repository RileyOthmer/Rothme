import { createFileRoute } from "@tanstack/react-router";
import { ComingSoonHub } from "@/features/analytics/ComingSoonHub";

export const Route = createFileRoute("/_authenticated/analytics/custom")({
  head: () => ({ meta: [{ title: "Custom Dashboards — ROTHME" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ComingSoonHub
      title="Custom Dashboards" phase={3}
      subtitle="Build unlimited dashboards. Drag widgets, resize charts, save templates, share with your team."
      kpis={["Any KPI from any connected plugin", "Cross-platform derived metrics", "Team-shared and personal boards"]}
      charts={["Every primitive: Line · Bar · Area · Pie · Treemap · Heatmap · Funnel · Radar · Gauge · Geo · Table"]}
    />
  ),
});
