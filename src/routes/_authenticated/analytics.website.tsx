import { createFileRoute } from "@tanstack/react-router";
import { ComingSoonHub } from "@/features/analytics/ComingSoonHub";

export const Route = createFileRoute("/_authenticated/analytics/website")({
  head: () => ({ meta: [{ title: "Website Analytics — ROTHME" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ComingSoonHub
      title="Website Analytics" phase={5}
      subtitle="Sessions, users, and behavior — powered by GA4 with plain-English explanations."
      kpis={["Sessions", "Users", "New users", "Returning visitors", "Bounce rate", "Avg session duration", "Pages/session", "Conversions"]}
      charts={["Line (sessions)", "Geo map (visitors)", "Sankey (user flow)", "Bar (top pages)", "Donut (channels)"]}
    />
  ),
});
