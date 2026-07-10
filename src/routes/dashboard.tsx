import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { MessageCircle } from "lucide-react";
import { Toaster, toast } from "sonner";

import { getDashboardData } from "@/lib/dashboard-mock";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { AISummary } from "@/components/dashboard/AISummary";
import { HealthScore } from "@/components/dashboard/HealthScore";
import { GrowthCallout } from "@/components/dashboard/GrowthCallout";
import { PerformanceSummary } from "@/components/dashboard/PerformanceSummary";
import { Checklist } from "@/components/dashboard/Checklist";
import { UpcomingList } from "@/components/dashboard/UpcomingList";
import { AssistantPanel } from "@/components/assistant/AssistantPanel";
import { openAssistant } from "@/hooks/use-assistant";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Northstar" },
      {
        name: "description",
        content:
          "Your marketing at a glance — plain-English insights, today's priorities, and what to do next.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const [nonce, setNonce] = useState(0);
  const data = useMemo(() => getDashboardData("there"), [nonce]);
  const prioritiesRef = useRef<HTMLDivElement>(null);

  const scrollToPriorities = () => {
    prioritiesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardHeader
        onRefresh={() => {
          setNonce((n) => n + 1);
          toast("Refreshed your dashboard.");
        }}
      />

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <AISummary data={data.aiSummary} name={data.greetingName} />

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            <HealthScore data={data.health} onAction={scrollToPriorities} />
            <GrowthCallout data={data.growth} />
            <PerformanceSummary rows={data.performance} />
          </div>

          <aside className="space-y-6 lg:col-span-4">
            <section
              ref={prioritiesRef}
              className="rounded-xl border border-border bg-surface p-6 shadow-sm sm:p-7"
            >
              <div className="mb-1 flex items-center justify-between">
                <span className="eyebrow">Today's priorities</span>
                <span className="text-xs text-muted-foreground">
                  {data.priorities.length} things
                </span>
              </div>
              <p className="mb-5 text-xs text-muted-foreground">
                Do these three today and you're set.
              </p>
              <Checklist
                storageKey="northstar.priorities"
                items={data.priorities.map((p) => ({
                  id: p.id,
                  title: p.title,
                  why: p.why,
                  action: p.action,
                }))}
                onAction={(item) => toast(`Starting: ${item.action?.toLowerCase()}`)}
              />
            </section>

            <section className="rounded-xl border border-border bg-surface p-6 shadow-sm sm:p-7">
              <div className="eyebrow mb-4">Tasks this week</div>
              <Checklist
                storageKey="northstar.tasks"
                items={data.tasks.map((t) => ({ id: t.id, title: t.title }))}
              />
            </section>

            <UpcomingList items={data.upcoming} />
          </aside>
        </div>

        <p className="mt-14 text-center text-xs text-muted-foreground">
          Everything here is written in plain English. Nothing to Google.
        </p>
      </main>

      <Toaster theme="light" position="bottom-right" />
    </div>
  );
}
