import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

type NavItem = {
  label: string;
  to?: string;
  soon?: boolean;
};

const ITEMS: NavItem[] = [
  { label: "Overview",   to: "/analytics" },
  { label: "Executive",  to: "/analytics/executive" },
  { label: "Platforms",  to: "/analytics/unified" },
  { label: "Charts",     to: "/analytics/charts" },
  { label: "Campaigns",  soon: true },
  { label: "Content",    soon: true },
  { label: "Audience",   soon: true },
  { label: "Ads",        soon: true },
  { label: "Revenue",    soon: true },
  { label: "AI Insights", soon: true },
  { label: "Custom",     soon: true },
];

export function AnalyticsHubNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="scrollbar-none -mx-4 flex gap-1 overflow-x-auto border-b border-border/60 px-4 pb-1">
      {ITEMS.map((item) => {
        if (item.soon) {
          return (
            <span
              key={item.label}
              className="inline-flex shrink-0 items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground/60"
              title="Available in the next phase"
            >
              {item.label}
              <Sparkles className="h-3 w-3 opacity-60" />
            </span>
          );
        }
        const active =
          item.to === pathname ||
          (item.to && item.to !== "/analytics" && pathname.startsWith(item.to));
        return (
          <Link
            key={item.label}
            to={item.to!}
            className={cn(
              "shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
