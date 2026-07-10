import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Toaster } from "sonner";

import { getProfile } from "@/lib/profile.functions";
import { AppHeader } from "@/components/layout/AppHeader";
import { DecisionCenter } from "@/features/decisions/DecisionCenter";
import { HealthScoreCard } from "@/features/health/HealthScoreCard";
import { getSeedHealthScore } from "@/features/health/seed";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Decisions — Velora" },
      {
        name: "description",
        content:
          "The AI Decision Center. A short, calm list of what to do today for your marketing — with the reason, the impact, and how confident Velora is.",
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

  const firstName = profileQuery.data?.full_name?.split(" ")[0] ?? "there";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <DecisionCenter firstName={firstName} hasConnections={true} />
      </main>

      <Toaster position="bottom-right" />
    </div>
  );
}
