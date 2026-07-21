import {
  BookOpen,
  HelpCircle,
  FileText,
  ArrowLeftRight,
  Calculator,
  Database,
  BarChart3,
  Library,
  type LucideIcon,
} from "lucide-react";

import { QUICK_ACTIONS, askAI, type QuickActionIcon } from "./quick-actions";

const ICONS: Record<QuickActionIcon, LucideIcon> = {
  explain: BookOpen,
  define: HelpCircle,
  summary: FileText,
  changes: ArrowLeftRight,
  formula: Calculator,
  source: Database,
  chart: BarChart3,
  glossary: Library,
};

/**
 * Premium action cards on the dashboard. Each card opens the global
 * AI Marketing Assistant preconfigured for a specific task — no
 * duplicated AI logic; every prompt streams through /api/chat.
 */
export function QuickActions({ className }: { className?: string }) {
  return (
    <section aria-labelledby="quick-actions-heading" className={className}>
      <div className="mb-4 flex items-baseline justify-between">
        <div>
          <h2
            id="quick-actions-heading"
            className="text-base font-semibold tracking-tight text-foreground"
          >
            Quick actions
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            One click — your AI CMO drafts it. Nothing publishes without your review.
          </p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {QUICK_ACTIONS.map((action) => {
          const Icon = ICONS[action.icon];
          return (
            <button
              key={action.id}
              type="button"
              onClick={() => askAI({ prompt: action.prompt, source: `quick-action:${action.id}` })}
              className="group relative flex h-full flex-col items-start gap-3 overflow-hidden rounded-2xl border border-border bg-card p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-0 bg-gradient-to-br from-primary/[0.06] via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100"
              />
              <span className="relative grid h-10 w-10 place-items-center rounded-xl border border-border bg-background text-foreground shadow-sm transition-colors group-hover:border-primary/40 group-hover:text-primary">
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <span className="relative min-w-0">
                <span className="block text-sm font-semibold tracking-tight text-foreground">
                  {action.label}
                </span>
                <span className="mt-1 block text-[12px] leading-snug text-muted-foreground">
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
