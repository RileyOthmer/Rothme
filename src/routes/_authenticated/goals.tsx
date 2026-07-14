import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Target } from "lucide-react";

import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import { GoalCard } from "@/features/goals/GoalCard";
import { GoalForm } from "@/features/goals/GoalForm";
import { RecommendedGoals } from "@/features/goals/RecommendedGoals";
import { loadGoals, saveGoals } from "@/features/goals/store";
import type { Goal } from "@/features/goals/types";

export const Route = createFileRoute("/_authenticated/goals")({
  head: () => ({
    meta: [
      { title: "Goals — ROTHME" },
      {
        name: "description",
        content:
          "Set the business goals that matter — revenue, orders, ROAS, traffic, leads — and let ROTHME forecast where you'll land and what to do about it.",
      },
    ],
  }),
  component: GoalsPage,
});

function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    setGoals(loadGoals());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveGoals(goals);
  }, [goals, hydrated]);

  const existingMetrics = new Set(goals.map((g) => g.metric));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <main className="mx-auto max-w-4xl space-y-8 px-4 py-10 sm:px-6 sm:py-14">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Goals</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              The numbers you're aiming at. ROTHME tracks progress, forecasts where you'll land,
              and tells you what to do next.
            </p>
          </div>
          {!creating && (
            <Button onClick={() => setCreating(true)}>
              <Plus className="mr-1.5 h-4 w-4" />
              New goal
            </Button>
          )}
        </header>

        {creating && (
          <GoalForm
            onCancel={() => setCreating(false)}
            onSubmit={(goal) => {
              setGoals((prev) => [goal, ...prev]);
              setCreating(false);
            }}
          />
        )}

        {hydrated && goals.length === 0 && !creating && (
          <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-muted text-muted-foreground">
              <Target className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-lg font-medium text-foreground">Set your first goal</h2>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
              Pick one number that matters — revenue, orders, followers — and tell ROTHME where you
              want it to be. We'll take it from there.
            </p>
            <Button className="mt-4" onClick={() => setCreating(true)}>
              <Plus className="mr-1.5 h-4 w-4" />
              New goal
            </Button>
          </div>
        )}

        <div className="space-y-4">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onUpdate={(updated) =>
                setGoals((prev) => prev.map((g) => (g.id === updated.id ? updated : g)))
              }
              onDelete={(id) => setGoals((prev) => prev.filter((g) => g.id !== id))}
            />
          ))}
        </div>

        {hydrated && (
          <RecommendedGoals
            existingMetrics={existingMetrics}
            onAdd={(goal) => setGoals((prev) => [goal, ...prev])}
          />
        )}
      </main>
    </div>
  );
}
