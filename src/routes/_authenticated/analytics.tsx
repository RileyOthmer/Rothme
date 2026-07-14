import { createFileRoute, Outlet } from "@tanstack/react-router";
import { RequirePro } from "@/components/RequirePro";

export const Route = createFileRoute("/_authenticated/analytics")({
  component: () => (
    <RequirePro featureName="Unified analytics">
      <Outlet />
    </RequirePro>
  ),
});

