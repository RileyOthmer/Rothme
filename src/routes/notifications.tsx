import { createFileRoute, Link } from "@tanstack/react-router";
import { Settings2 } from "lucide-react";
import { Wordmark } from "@/components/brand/Wordmark";
import { NotificationCard } from "@/components/notifications/NotificationCard";
import { useNotifications } from "@/hooks/use-notifications";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — Velora" },
      {
        name: "description",
        content:
          "Only the changes that matter — what happened, why, what to do, and the business impact.",
      },
    ],
  }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const { notifications, unreadCount, markAllRead, markRead, dismiss, isRead } =
    useNotifications();

  const critical = notifications.filter((n) => n.severity === "critical");
  const opportunities = notifications.filter((n) => n.severity === "opportunity");
  const info = notifications.filter((n) => n.severity === "info");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3.5 sm:px-6">
          <Wordmark />
          <Link
            to="/dashboard"
            className="text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            ← Back to dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Notifications</p>
            <h1 className="mt-2 font-serif text-4xl leading-tight text-foreground">
              Only what actually needs you.
            </h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              We stay quiet unless something meaningful changes. Every alert
              tells you what happened, why it matters, what to do, and the
              likely business impact.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground shadow-xs hover:bg-surface-2"
              >
                Mark all read
              </button>
            )}
            <Link
              to="/settings/notifications"
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground shadow-xs hover:bg-surface-2"
            >
              <Settings2 className="h-3.5 w-3.5" />
              Settings
            </Link>
          </div>
        </div>

        {notifications.length === 0 ? (
          <div className="mt-14 rounded-xl border border-border bg-surface p-10 text-center shadow-xs">
            <p className="text-base font-medium text-foreground">
              You're all caught up.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              We'll ping you the moment something meaningful changes.
            </p>
          </div>
        ) : (
          <div className="mt-10 space-y-10">
            <Group title="Needs attention" items={critical}>
              {critical.map((n) => (
                <NotificationCard
                  key={n.id}
                  notification={n}
                  unread={!isRead(n.id)}
                  onOpen={() => markRead(n.id)}
                  onDismiss={() => dismiss(n.id)}
                />
              ))}
            </Group>

            <Group title="Opportunities" items={opportunities}>
              {opportunities.map((n) => (
                <NotificationCard
                  key={n.id}
                  notification={n}
                  unread={!isRead(n.id)}
                  onOpen={() => markRead(n.id)}
                  onDismiss={() => dismiss(n.id)}
                />
              ))}
            </Group>

            <Group title="For your info" items={info}>
              {info.map((n) => (
                <NotificationCard
                  key={n.id}
                  notification={n}
                  unread={!isRead(n.id)}
                  onOpen={() => markRead(n.id)}
                  onDismiss={() => dismiss(n.id)}
                />
              ))}
            </Group>
          </div>
        )}
      </main>
    </div>
  );
}

function Group({
  title,
  items,
  children,
}: {
  title: string;
  items: unknown[];
  children: React.ReactNode;
}) {
  if (items.length === 0) return null;
  return (
    <section>
      <h2 className="eyebrow mb-3">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
