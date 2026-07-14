import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/dev-center/")({
  beforeLoad: () => { throw redirect({ to: "/dev-center/integrations" }); },
});
