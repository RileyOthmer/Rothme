import type { HealthStatus, Verdict } from "@/lib/dashboard-mock";

const healthMap: Record<HealthStatus, { label: string; dot: string; text: string }> = {
  healthy: { label: "Healthy", dot: "bg-success", text: "text-success" },
  attention: { label: "Needs attention", dot: "bg-warning", text: "text-warning" },
  risk: { label: "At risk", dot: "bg-danger", text: "text-danger" },
};

const verdictMap: Record<Verdict, { dot: string; text: string }> = {
  working: { dot: "bg-success", text: "text-success" },
  steady: { dot: "bg-muted-foreground", text: "text-muted-foreground" },
  slipping: { dot: "bg-danger", text: "text-danger" },
};

export function HealthPill({ status }: { status: HealthStatus }) {
  const s = healthMap[status];
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-2 px-3 py-1 text-xs font-medium">
      <span className={"h-1.5 w-1.5 rounded-full " + s.dot} aria-hidden />
      <span className={s.text}>{s.label}</span>
    </span>
  );
}

export function VerdictPill({ verdict }: { verdict: Verdict }) {
  const v = verdictMap[verdict];
  const label = verdict.charAt(0).toUpperCase() + verdict.slice(1);
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium">
      <span className={"h-1.5 w-1.5 rounded-full " + v.dot} aria-hidden />
      <span className={v.text}>{label}</span>
    </span>
  );
}
