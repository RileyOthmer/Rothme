import { Link, useRouterState } from "@tanstack/react-router";
import { CalendarDays, Inbox, ImageIcon, PenSquare, Clock, CheckCircle2 } from "lucide-react";

const TABS = [
  { to: "/publishing/queue", label: "Queue", icon: Clock },
  { to: "/publishing/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/publishing/compose", label: "Compose", icon: PenSquare },
  { to: "/publishing/drafts", label: "Drafts", icon: Inbox },
  { to: "/publishing/approvals", label: "Approvals", icon: CheckCircle2 },
  { to: "/publishing/media", label: "Media", icon: ImageIcon },
] as const;

export function PublishingNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex flex-wrap items-center gap-1 border-b border-border pb-3" aria-label="Publishing">
      {TABS.map((t) => {
        const active = pathname === t.to || pathname.startsWith(t.to + "/");
        return (
          <Link
            key={t.to}
            to={t.to}
            className={
              "inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-colors " +
              (active
                ? "bg-surface text-foreground"
                : "text-muted-foreground hover:bg-surface hover:text-foreground")
            }
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
