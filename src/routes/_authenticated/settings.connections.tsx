import { createFileRoute, Link } from "@tanstack/react-router";
import { Toaster } from "sonner";

import { AppHeader } from "@/components/layout/AppHeader";
import { IntegrationHub } from "@/features/integrations/IntegrationHub";

export const Route = createFileRoute("/_authenticated/settings/connections")({
  head: () => ({
    meta: [
      { title: "Integrations — Velora" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ConnectionsSettings,
});

function ConnectionsSettings() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <nav className="mb-8 flex gap-1 border-b border-border">
          <Link
            to="/settings/profile"
            className="border-b-2 border-transparent px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
          >
            Profile
          </Link>
          <Link
            to="/settings/connections"
            className="border-b-2 border-foreground px-3 py-2 text-sm font-medium"
          >
            Integrations
          </Link>
          <Link
            to="/settings/notifications"
            className="border-b-2 border-transparent px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
          >
            Notifications
          </Link>
        </nav>

        <IntegrationHub />
      </main>
      <Toaster theme="light" position="bottom-right" />
    </div>
  );
}
