import { createFileRoute } from "@tanstack/react-router";
import { ComingSoonHub } from "@/features/analytics/ComingSoonHub";

export const Route = createFileRoute("/_authenticated/analytics/competitor")({
  head: () => ({ meta: [{ title: "Competitor Analytics — ROTHME" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ComingSoonHub
      title="Competitor Analytics" phase={5}
      subtitle="Track competitor accounts, share of voice, and content strategy across every platform."
      kpis={["Follower growth vs peers", "Post frequency", "Engagement rate benchmark", "Share of voice", "Content-type mix"]}
      charts={["Radar (you vs competitor)", "Line (follower growth)", "Bar (posting cadence)", "Table (top competitor posts)"]}
    />
  ),
});
