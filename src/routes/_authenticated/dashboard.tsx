import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useRef, useState, useEffect } from "react";
import { Toaster, toast } from "sonner";

import { getDashboardData } from "@/lib/dashboard-mock";
import { getProfile } from "@/lib/profile.functions";
import { AppHeader } from "@/components/layout/AppHeader";
import { AISummary } from "@/components/dashboard/AISummary";
import { HealthScore } from "@/components/dashboard/HealthScore";
import { BusinessSummary } from "@/components/dashboard/BusinessSummary";
import { GrowthMetrics } from "@/components/dashboard/GrowthMetrics";
import { ChannelCard } from "@/components/dashboard/ChannelCard";
import { Checklist } from "@/components/dashboard/Checklist";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Northstar" },
      {
        name: "description",
        content:
          "Is your business healthy? A one-glance answer, today's priorities, and what to do next — in plain English.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const router = useRouter();
  const fetchProfile = useServerFn(getProfile);
  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: () => fetchProfile(),
  });

  useEffect(() => {
    if (profileQuery.data && !profileQuery.data.onboarded_at) {
      router.navigate({ to: "/onboarding" });
    }
  }, [profileQuery.data, router]);

  const [nonce, setNonce] = useState(0);
  const firstName = profileQuery.data?.full_name?.split(" ")[0] ?? "there";
  const data = useMemo(() => getDashboardData(firstName), [nonce, firstName]);
  const prioritiesRef = useRef<HTMLDivElement>(null);

  const scrollToPriorities = () => {
    prioritiesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const ads = data.performance.find((p) => p.area === "Ads");
  const social = data.performance.find((p) => p.area === "Posts");
  const email = data.performance.find((p) => p.area === "Emails");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader
        onRefresh={() => {
          setNonce((n) => n + 1);
          toast("Refreshed your dashboard.");
        }}
      />

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6 sm:py-14">
        {/* 1. Is my business healthy? */}
        <HealthScore data={data.health} onAction={scrollToPriorities} />

        {/* 2. Today's priorities */}
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
            Do these today and you're set.
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

        {/* 3. Business summary */}
        <BusinessSummary text={data.businessSummary} />

        {/* 4. Recent growth — revenue, leads, traffic */}
        <GrowthMetrics metrics={data.growthMetrics} />

        {/* 5–7. Channel performance */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {ads ? <ChannelCard row={ads} /> : null}
          {social ? <ChannelCard row={social} /> : null}
          {email ? <ChannelCard row={email} /> : null}
        </div>

        {/* 8. AI summary */}
        <AISummary data={data.aiSummary} name={data.greetingName} />

        <p className="pt-6 text-center text-xs text-muted-foreground">
          Everything here is written in plain English. Nothing to Google.
        </p>
      </main>

      <Toaster theme="light" position="bottom-right" />
    </div>
  );
}
