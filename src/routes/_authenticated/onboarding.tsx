import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({
    meta: [
      { title: "Welcome to Velora" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <Outlet />,
});
