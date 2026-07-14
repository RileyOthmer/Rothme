import { Link } from "@tanstack/react-router";
import {
  BarChart3,
  Sparkles,
  CalendarDays,
  Inbox,
  Users2,
  Layers,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import type { WidgetId } from "./preferences";

type WidgetMeta = {
  id: WidgetId;
  title: string;
  primaryLine: string;
  secondaryLine: string;
  icon: LucideIcon;
  ctaLabel: string;
  ctaTo: string;
  accent: string; // tailwind gradient classes
};

export const WIDGETS: Record<WidgetId, WidgetMeta> = {
  analytics: {
    id: "analytics",
    title: "Analytics",
    primaryLine: "What moved this week — and why.",
    secondaryLine: "Reach, engagement and conversions across every connected channel, explained in plain English.",
    icon: BarChart3,
    ctaLabel: "Open analytics",
    ctaTo: "/reports",
    accent: "from-sky-500/20 to-cyan-500/10",
  },
  ai: {
    id: "ai",
    title: "AI Assistant",
    primaryLine: "Ask ROTHME anything.",
    secondaryLine: "Draft a post, summarize last week, or plan a campaign — always with reasoning and confidence.",
    icon: Sparkles,
    ctaLabel: "Start a chat",
    ctaTo: "/assistant",
    accent: "from-fuchsia-500/25 to-primary/15",
  },
  scheduling: {
    id: "scheduling",
    title: "Calendar",
    primaryLine: "Plan and schedule everything in one place.",
    secondaryLine: "Every scheduled post across every channel, on one calendar.",
    icon: CalendarDays,
    ctaLabel: "Open calendar",
    ctaTo: "/dashboard",
    accent: "from-emerald-500/20 to-teal-500/10",
  },
  inbox: {
    id: "inbox",
    title: "Unified Inbox",
    primaryLine: "Every message, one place.",
    secondaryLine: "Reply to comments and DMs from every network without switching tabs.",
    icon: Inbox,
    ctaLabel: "Open inbox",
    ctaTo: "/dashboard",
    accent: "from-orange-500/20 to-amber-500/10",
  },
  accounts: {
    id: "accounts",
    title: "Accounts",
    primaryLine: "All your connected accounts at a glance.",
    secondaryLine: "Health, followers and last activity for every channel you manage.",
    icon: Layers,
    ctaLabel: "Manage accounts",
    ctaTo: "/settings/connections",
    accent: "from-indigo-500/20 to-violet-500/10",
  },
  collab: {
    id: "collab",
    title: "Team",
    primaryLine: "Move as a team, not a group chat.",
    secondaryLine: "Assign tasks, request approvals, and see what your teammates shipped.",
    icon: Users2,
    ctaLabel: "Open team",
    ctaTo: "/team",
    accent: "from-rose-500/20 to-pink-500/10",
  },
};

export function DashboardWidget({
  widgetId,
  primary,
}: {
  widgetId: WidgetId;
  primary?: boolean;
}) {
  const w = WIDGETS[widgetId];
  const Icon = w.icon;
  return (
    <Link
      to={w.ctaTo}
      className={
        "group relative block overflow-hidden rounded-2xl border bg-card p-6 transition-all hover:-translate-y-0.5 hover:shadow-lg " +
        (primary
          ? "border-primary/40 ring-1 ring-primary/20"
          : "border-border")
      }
    >
      <div
        aria-hidden
        className={
          "pointer-events-none absolute inset-0 -z-0 bg-gradient-to-br opacity-70 " + w.accent
        }
      />
      <div className="relative flex items-start justify-between gap-4">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-background/80 text-foreground shadow-sm backdrop-blur">
          <Icon className="h-5 w-5" />
        </div>
        {primary && (
          <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary">
            Recommended for you
          </span>
        )}
      </div>
      <div className="relative mt-5">
        <h3 className="text-base font-semibold tracking-tight">{w.title}</h3>
        <p className="mt-1 text-sm font-medium">{w.primaryLine}</p>
        <p className="mt-1.5 text-sm text-muted-foreground">{w.secondaryLine}</p>
      </div>
      <div className="relative mt-5 flex items-center gap-1 text-sm font-medium text-primary opacity-90 group-hover:opacity-100">
        {w.ctaLabel}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}
