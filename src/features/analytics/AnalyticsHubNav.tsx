import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

type NavItem = { label: string; to: string };

const ITEMS: NavItem[] = [
  { label: "Overview",     to: "/analytics/overview" },
  { label: "Platforms",    to: "/analytics/platforms" },
  { label: "Campaigns",    to: "/analytics/campaigns" },
  { label: "Content",      to: "/analytics/content" },
  { label: "Audience",     to: "/analytics/audience" },
  { label: "Advertising",  to: "/analytics/advertising" },
  { label: "Revenue",      to: "/analytics/revenue" },
  { label: "SEO",          to: "/analytics/seo" },
  { label: "Website",      to: "/analytics/website" },
  { label: "Competitor",   to: "/analytics/competitor" },
  { label: "Custom",       to: "/analytics/custom" },
  { label: "AI Insights",  to: "/analytics/ai-insights" },
  { label: "Reports",      to: "/analytics/reports" },
  { label: "Forecasting",  to: "/analytics/forecasting" },
  { label: "Alerts",       to: "/analytics/alerts" },
  { label: "Developer",    to: "/analytics/developer" },
];

export function AnalyticsHubNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="scrollbar-none -mx-4 flex gap-1 overflow-x-auto border-b border-border/60 px-4 pb-1">
      {ITEMS.map((item) => {
        const active = pathname === item.to || pathname.startsWith(item.to + "/");
        return (
          <Link
            key={item.to}
            to={item.to}
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
