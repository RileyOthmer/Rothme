import { Link } from "@tanstack/react-router";
import { Bell, Settings2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useNotifications } from "@/hooks/use-notifications";
import { NotificationCard } from "./NotificationCard";

export function NotificationBell() {
  const { notifications, unreadCount, markAllRead, markRead, dismiss, isRead } =
    useNotifications();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={
            unreadCount > 0
              ? `Notifications, ${unreadCount} unread`
              : "Notifications"
          }
          className="relative inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface text-foreground shadow-xs transition-colors hover:bg-surface-2"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span
              aria-hidden
              className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-[380px] p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Notifications</p>
            <p className="text-xs text-muted-foreground">
              Only what actually needs you.
            </p>
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-surface-2 hover:text-foreground"
              >
                Mark all read
              </button>
            )}
            <Link
              to="/settings/notifications"
              aria-label="Notification settings"
              className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-surface-2 hover:text-foreground"
            >
              <Settings2 className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        <div className="max-h-[420px] overflow-y-auto p-3">
          {notifications.length === 0 ? (
            <div className="px-2 py-10 text-center">
              <p className="text-sm font-medium text-foreground">You're all set.</p>
              <p className="mt-1 text-xs text-muted-foreground">
                We'll let you know when something meaningful changes.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {notifications.slice(0, 4).map((n) => (
                <li key={n.id}>
                  <NotificationCard
                    notification={n}
                    unread={!isRead(n.id)}
                    compact
                    onOpen={() => markRead(n.id)}
                    onDismiss={() => dismiss(n.id)}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-border px-4 py-2.5 text-right">
          <Link
            to="/notifications"
            className="text-xs font-medium text-foreground underline-offset-4 hover:underline"
          >
            See all
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
