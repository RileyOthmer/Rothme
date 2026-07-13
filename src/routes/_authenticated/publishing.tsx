import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { PublishingNav } from "@/features/publishing/PublishingNav";

export const Route = createFileRoute("/_authenticated/publishing")({
  beforeLoad: ({ location }) => {
    if (location.pathname === "/publishing") {
      throw redirect({ to: "/publishing/queue" });
    }
  },
  component: PublishingLayout,
});

function PublishingLayout() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <header className="mb-4">
        <h1 className="text-2xl font-semibold tracking-tight">Publishing</h1>
        <p className="text-sm text-muted-foreground">
          Compose, schedule and ship content across every connected platform.
        </p>
      </header>
      <PublishingNav />
      <div className="mt-6">
        <Outlet />
      </div>
    </div>
  );
}
