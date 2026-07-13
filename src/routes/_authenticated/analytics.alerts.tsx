import { createFileRoute } from "@tanstack/react-router";
import { ComingSoonHub } from "@/features/analytics/ComingSoonHub";

export const Route = createFileRoute("/_authenticated/analytics/alerts")({
  head: () => ({ meta: [{ title: "Alerts — Velora" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ComingSoonHub
      title="Alerts" phase={4}
      subtitle="Threshold and anomaly-detection alerts on any KPI, routed to notifications, email, or Slack."
      kpis={["Threshold breaches (ROAS < 2, spend > $X)", "Anomaly detection (7-day baseline)", "Spike / drop notifications"]}
      charts={["Alert timeline", "Rule builder", "Per-KPI history with triggered markers"]}
    />
  ),
});
