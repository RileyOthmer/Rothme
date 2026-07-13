import { Layers3, Layout, GitCompare } from "lucide-react";
import { cn } from "@/lib/utils";

export type AnalyticsMode = "unified" | "platform" | "comparison";

const MODES: { id: AnalyticsMode; label: string; icon: typeof Layers3; hint: string }[] = [
  { id: "unified",    label: "Unified",    icon: Layers3,    hint: "Every platform merged" },
  { id: "platform",   label: "Platform",   icon: Layout,     hint: "Native metrics only" },
  { id: "comparison", label: "Comparison", icon: GitCompare, hint: "Side-by-side (Phase 2)" },
];

export function ModeSwitcher({
  value, onChange, disabledModes = [],
}: {
  value: AnalyticsMode;
  onChange: (m: AnalyticsMode) => void;
  disabledModes?: AnalyticsMode[];
}) {
  return (
    <div
      role="tablist"
      aria-label="Analytics mode"
      className="inline-flex items-center rounded-full border border-border bg-card p-1 text-xs font-medium"
    >
      {MODES.map((m) => {
        const Icon = m.icon;
        const active = m.id === value;
        const disabled = disabledModes.includes(m.id);
        return (
          <button
            key={m.id}
            role="tab"
            aria-selected={active}
            type="button"
            disabled={disabled}
            onClick={() => onChange(m.id)}
            title={m.hint}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-colors",
              active && "bg-foreground text-background",
              !active && !disabled && "text-muted-foreground hover:text-foreground",
              disabled && "cursor-not-allowed text-muted-foreground/40",
            )}
          >
            <Icon className="h-3 w-3" />
            {m.label}
          </button>
        );
      })}
    </div>
  );
}
