import { createFileRoute, Outlet } from "@tanstack/react-router";
import { RequirePro } from "@/components/RequirePro";

export const Route = createFileRoute("/_authenticated/dev-center")({
  head: () => ({
    meta: [
      { title: "Developer Center — ROTHME" },
      { name: "description", content: "Universal integration system for connecting, testing, and monitoring every marketing platform in ROTHME." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <RequirePro featureName="The Developer Center">
      <Outlet />
    </RequirePro>
  ),
});

