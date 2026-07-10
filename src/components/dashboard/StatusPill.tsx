import type { HealthStatus, Verdict } from "@/lib/dashboard-mock";

const healthMap: Record<HealthStatus, { label: string; dot: string; text: string }> = {
  healthy: { label: "Healthy", dot: "bg-success", text: "text-success" },
  attention: { label: "Needs attention", dot: "bg-warning", text: "text-warning" },
  risk: { label: "At risk", dot: "bg-danger", text: "text-danger" },
};

const verdictMap: Record<Verdict, { dot: string; text: string; label: string }> = {
  working: { dot: "bg-success", text: "text-success", label: "Working" },
  steady: { dot: "bg-muted-foreground", text: "text-muted-foreground", label: "Steady" },
  slipping: { dot: "bg-danger", text: "text-danger", label: "Slipping" },
};

export function HealthPill({ status }: { status: HealthStatus }) {
  const s = healthMap[status];
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium shadow-xs">
      <span className={"h-1.5 w-1.5 rounded-full " + s.dot} aria-hidden />
      <span className={s.text}>{s.label}</span>
    </span>
  );
}

export function VerdictPill({ verdict }: { verdict: Verdict }) {
  const v = verdictMap[verdict];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-0.5 text-[11px] font-medium shadow-xs">
      <span className={"h-1.5 w-1.5 rounded-full " + v.dot} aria-hidden />
      <span className={v.text}>{v.label}</span>
    </span>
  );
}
