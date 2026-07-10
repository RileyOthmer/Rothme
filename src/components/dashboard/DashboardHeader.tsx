import { RefreshCw } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function DashboardHeader({ onRefresh }: { onRefresh?: () => void }) {
  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-md bg-primary text-primary-foreground">
            <span className="text-[11px] font-bold">N</span>
          </span>
          <span className="text-sm font-semibold tracking-tight">Northstar</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-muted-foreground sm:inline">{today}</span>
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-surface px-3 text-xs font-medium text-foreground transition-colors hover:bg-surface-2"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
        </div>
      </div>
    </header>
  );
}
