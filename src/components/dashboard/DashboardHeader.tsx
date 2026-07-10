import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { RefreshCw, Sparkles } from "lucide-react";
import { Wordmark } from "@/components/brand/Wordmark";
import { NotificationBell } from "@/components/notifications/NotificationBell";


export function DashboardHeader({ onRefresh }: { onRefresh?: () => void }) {
  // Format the date on the client only — avoids SSR/locale hydration mismatch.
  const [today, setToday] = useState<string>("");
  useEffect(() => {
    setToday(
      new Date().toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
      }),
    );
  }, []);

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
        <Wordmark />
        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-muted-foreground sm:inline">{today}</span>
          <Link
            to="/assistant"
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-surface px-3 text-xs font-medium text-foreground shadow-xs transition-all duration-150 hover:bg-surface-2"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Ask
          </Link>
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-surface px-3 text-xs font-medium text-foreground shadow-xs transition-all duration-150 hover:bg-surface-2"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
          <NotificationBell />
          <span
            aria-hidden
            className="grid h-8 w-8 place-items-center rounded-full border border-border bg-surface text-xs font-medium text-foreground shadow-xs"
          >
            N
          </span>
        </div>
      </div>
    </header>
  );
}
