import { createFileRoute } from "@tanstack/react-router";
import { ComingSoonHub } from "@/features/analytics/ComingSoonHub";

export const Route = createFileRoute("/_authenticated/analytics/developer")({
  head: () => ({ meta: [{ title: "Developer Analytics — ROTHME" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ComingSoonHub
      title="Developer Analytics" phase={4}
      subtitle="Every chart's raw API payload, mapped fields, calculation formula, last sync time, and endpoint — for engineers who want to see under the hood."
      kpis={["Mapped API fields per KPI", "Raw JSON samples", "Formulas & derived metrics", "Last sync time per plugin", "Endpoint health"]}
      charts={["Per-chart 'Show source' drawer", "Endpoint latency chart", "Sync-error log timeline"]}
    />
  ),
});
