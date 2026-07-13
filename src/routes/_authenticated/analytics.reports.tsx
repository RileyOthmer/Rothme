import { createFileRoute } from "@tanstack/react-router";
import { ComingSoonHub } from "@/features/analytics/ComingSoonHub";

export const Route = createFileRoute("/_authenticated/analytics/reports")({
  head: () => ({ meta: [{ title: "Report Builder — Velora" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ComingSoonHub
      title="Report Builder" phase={3}
      subtitle="Pick charts, KPIs, platforms, date ranges, and branding. Export to PDF, XLSX, CSV, or PowerPoint."
      kpis={["Every KPI in the Analytics Center", "Team and client-branded templates", "Scheduled recurring reports"]}
      charts={["Drag-in any chart primitive", "Cover page + branding", "Executive summary + AI narrative", "Table of contents"]}
    />
  ),
});
