import { createFileRoute } from "@tanstack/react-router";
import { ComingSoonHub } from "@/features/analytics/ComingSoonHub";

export const Route = createFileRoute("/_authenticated/analytics/audience")({
  head: () => ({ meta: [{ title: "Audience Analytics — Velora" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ComingSoonHub
      title="Audience Analytics" phase={2}
      subtitle="Who your audience is, where they are, and how they're growing across every platform."
      kpis={["Followers", "Audience growth", "New vs returning", "Age", "Gender", "Location", "Languages", "Devices", "Interests"]}
      charts={["Geo map (world/country/state/city)", "Donut (age/gender)", "Bar (top locations)", "Line (growth over time)", "Radar (interests)"]}
    />
  ),
});
