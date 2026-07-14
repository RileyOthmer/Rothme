import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/dev-center")({
  head: () => ({
    meta: [
      { title: "Developer Center — Velora" },
      { name: "description", content: "Universal integration system for connecting, testing, and monitoring every marketing platform in Velora." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <Outlet />,
});
