import { CheckCircle2, CircleDashed, AlertTriangle, Loader2 } from "lucide-react";
import type { ConnectionStatus } from "./types";

const MAP: Record<
  ConnectionStatus,
  { label: string; className: string; Icon: typeof CheckCircle2 }
> = {
  connected: {
    label: "Connected",
    className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-emerald-500/20",
    Icon: CheckCircle2,
  },
  syncing: {
    label: "Syncing",
    className: "bg-blue-500/10 text-blue-700 dark:text-blue-300 ring-blue-500/20",
    Icon: Loader2,
  },
  error: {
    label: "Needs attention",
    className: "bg-amber-500/10 text-amber-700 dark:text-amber-300 ring-amber-500/20",
    Icon: AlertTriangle,
  },
  disconnected: {
    label: "Not connected",
    className: "bg-surface-2 text-muted-foreground ring-border",
    Icon: CircleDashed,
  },
};

export function StatusPill({ status }: { status: ConnectionStatus }) {
  const m = MAP[status];
  return (
    <span
      className={
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset " +
        m.className
      }
    >
      <m.Icon className={"h-3 w-3 " + (status === "syncing" ? "animate-spin" : "")} />
      {m.label}
    </span>
  );
}
