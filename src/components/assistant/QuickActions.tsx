import {
  Megaphone,
  MessageSquare,
  CalendarDays,
  Rocket,
  MapPin,
  Music2,
  Youtube,
  type LucideIcon,
} from "lucide-react";

import { QUICK_ACTIONS, askAI, type QuickAction } from "./quick-actions";

const ICONS: Record<QuickAction["icon"], LucideIcon> = {
  post: MessageSquare,
  ad: Megaphone,
  plan: CalendarDays,
  campaign: Rocket,
  gbp: MapPin,
  tiktok: Music2,
  youtube: Youtube,
};

/**
 * Grid of Quick Actions for the dashboard.
 * Every button opens the shared Global Command Bar preconfigured with a task
 * prompt — no duplicated AI logic; all generation flows through /api/chat.
 */
export function QuickActions({ className }: { className?: string }) {
  return (
    <section aria-labelledby="quick-actions-heading" className={className}>
      <div className="mb-3 flex items-baseline justify-between">
        <h2
          id="quick-actions-heading"
          className="text-sm font-semibold tracking-tight text-foreground"
        >
          Quick actions
        </h2>
        <span className="text-[11px] text-muted-foreground">
          One click → drafted by Rothme AI · nothing publishes automatically
        </span>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {QUICK_ACTIONS.map((action) => {
          const Icon = ICONS[action.icon];
          return (
            <button
              key={action.id}
              type="button"
              onClick={() => askAI({ prompt: action.prompt, source: `quick-action:${action.id}` })}
              className="group flex items-start gap-3 rounded-xl border border-border bg-surface p-3 text-left transition-colors hover:border-border-strong hover:bg-surface-2"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border bg-background text-foreground">
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-foreground">
                  {action.label}
                </span>
                <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground">
                  {action.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
