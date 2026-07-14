import { createFileRoute } from "@tanstack/react-router";
import { DevCenterShell } from "@/features/dev-center/DevCenterShell";
import { Clock } from "lucide-react";

const JOBS = [
  { id: "social-sync",     name: "Social analytics sweep", cron: "*/15 * * * *", endpoint: "/api/public/cron/social-sync", desc: "Fetches analytics for every connected account and updates health scores." },
  { id: "publish",         name: "Publishing queue",       cron: "* * * * *",    endpoint: "/api/public/cron/publish",     desc: "Dispatches scheduled posts to their platforms." },
  { id: "weekly-reports",  name: "Weekly reports",         cron: "0 9 * * 1",    endpoint: "/api/public/hooks/generate-weekly-reports", desc: "Generates weekly executive report for every workspace." },
] as const;

export const Route = createFileRoute("/_authenticated/dev-center/scheduler")({
  component: SchedulerPage,
});

function SchedulerPage() {
  return (
    <DevCenterShell
      title="Scheduler"
      description="Background jobs managed by pg_cron. Each job hits a signed public endpoint on the app."
    >
      <ul className="space-y-3">
        {JOBS.map((j) => (
          <li key={j.id} className="rounded-2xl border border-border/60 bg-card/40 p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <p className="font-medium">{j.name}</p>
              <code className="ml-auto rounded bg-muted px-1.5 py-0.5 text-xs">{j.cron}</code>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{j.desc}</p>
            <p className="mt-1 font-mono text-[11px] text-muted-foreground">{j.endpoint}</p>
          </li>
        ))}
      </ul>
    </DevCenterShell>
  );
}
