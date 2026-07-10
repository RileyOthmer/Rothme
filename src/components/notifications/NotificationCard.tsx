import { Link } from "@tanstack/react-router";
import { AlertTriangle, Sparkles, Info, X } from "lucide-react";
import type { Notification } from "@/lib/notifications-mock";
import { CATEGORY_LABEL } from "@/lib/notifications-mock";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

const SEVERITY_STYLE = {
  critical: {
    icon: AlertTriangle,
    tone: "text-danger",
    ring: "bg-danger/10",
    label: "Needs attention",
  },
  opportunity: {
    icon: Sparkles,
    tone: "text-success",
    ring: "bg-success/10",
    label: "Opportunity",
  },
  info: {
    icon: Info,
    tone: "text-muted-foreground",
    ring: "bg-muted",
    label: "For your info",
  },
} as const;

export function NotificationCard({
  notification,
  unread,
  onDismiss,
  onOpen,
  compact = false,
}: {
  notification: Notification;
  unread: boolean;
  onDismiss?: () => void;
  onOpen?: () => void;
  compact?: boolean;
}) {
  const style = SEVERITY_STYLE[notification.severity];
  const Icon = style.icon;

  return (
    <article
      className={`group relative rounded-xl border border-border bg-surface p-5 shadow-xs transition-colors ${
        unread ? "border-border-strong" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full ${style.ring} ${style.tone}`}
        >
          <Icon className="h-4 w-4" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
            <span className={style.tone}>{style.label}</span>
            <span aria-hidden>·</span>
            <span>{CATEGORY_LABEL[notification.category]}</span>
            <span aria-hidden>·</span>
            <span>{timeAgo(notification.createdAt)}</span>
            {unread && (
              <span
                aria-label="Unread"
                className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-primary"
              />
            )}
          </div>

          <h3 className="mt-1.5 text-sm font-semibold text-foreground">
            {notification.title}
          </h3>

          {!compact && (
            <dl className="mt-3 grid grid-cols-1 gap-2.5 text-sm sm:grid-cols-2">
              <Field label="What happened" value={notification.what} />
              <Field label="Why it matters" value={notification.why} />
              <Field label="What to do" value={notification.action} />
              <Field label="Business impact" value={notification.impact} />
            </dl>
          )}

          {compact && (
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {notification.what}
            </p>
          )}

          <div className="mt-4 flex items-center gap-3">
            <Link
              to="/notifications"
              onClick={onOpen}
              className="text-xs font-medium text-foreground underline-offset-4 hover:underline"
            >
              {compact ? "See details" : "Open"}
            </Link>
            {onDismiss && (
              <button
                type="button"
                onClick={onDismiss}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>

        {onDismiss && !compact && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss notification"
            className="text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </article>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm text-foreground">{value}</dd>
    </div>
  );
}
