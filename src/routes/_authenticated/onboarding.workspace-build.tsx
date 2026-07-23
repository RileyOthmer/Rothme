import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Check, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { getOnboardingSession, saveOnboardingStep } from "@/lib/onboarding/session.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/onboarding/workspace-build")({
  head: () => ({ meta: [{ title: "Building your workspace — ROTHME" }, { name: "robots", content: "noindex" }] }),
  component: WorkspaceBuildStep,
});

const BUILD_LINES = [
  "Creating your dashboard…",
  "Building analytics…",
  "Configuring the AI assistant…",
  "Preparing your calendar…",
  "Setting up reports…",
  "Drafting a marketing strategy…",
  "Connecting workflows…",
];

const CHECKLIST_UPDATES: Record<number, string> = {
  0: "workspace_created",
  2: "ai_configured",
  4: "analytics_ready",
};

function WorkspaceBuildStep() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const getSession = useServerFn(getOnboardingSession);
  const save = useServerFn(saveOnboardingStep);
  const { data: session } = useQuery({ queryKey: ["onboarding-session"], queryFn: () => getSession() });

  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (progress >= BUILD_LINES.length) {
      setDone(true);
      // Mark workspace built + advance in background
      save({
        data: {
          step: "subscription",
          checklist: { workspace_created: true, ai_configured: true, analytics_ready: true },
        },
      })
        .then(() => qc.invalidateQueries({ queryKey: ["onboarding-session"] }))
        .catch(() => {});
      return;
    }
    const delay = 700 + Math.random() * 500;
    const t = setTimeout(() => {
      // Persist incremental checklist updates
      const key = CHECKLIST_UPDATES[progress];
      if (key) save({ data: { checklist: { [key]: true } } }).catch(() => {});
      setProgress((p) => p + 1);
    }, delay);
    return () => clearTimeout(t);
  }, [progress, save, qc]);

  return (
    <OnboardingShell currentStepId="workspace-build" session={session ?? null}>
      <div className="mx-auto max-w-2xl">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs">
          <Sparkles className="h-3 w-3 text-primary" />
          <span className="text-muted-foreground">Setting things up</span>
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          {done ? "Your workspace is ready." : "Building your ROTHME workspace…"}
        </h1>
        <p className="mt-3 text-muted-foreground">
          {done
            ? "Everything's provisioned. Next, connect the platforms ROTHME should watch."
            : "Sit back for a moment. This normally takes seconds."}
        </p>

        <div className="mt-10 space-y-2 rounded-2xl border border-border/50 bg-card/40 p-6 backdrop-blur-xl">
          {BUILD_LINES.map((line, i) => {
            const state = i < progress ? "done" : i === progress ? "active" : "pending";
            return (
              <div
                key={line}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
                  state === "active" && "bg-primary/5",
                  state === "pending" && "opacity-40",
                )}
              >
                <span className="flex h-6 w-6 items-center justify-center">
                  {state === "done" && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-primary">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                  {state === "active" && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                  {state === "pending" && (
                    <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
                  )}
                </span>
                <span
                  className={cn(
                    "text-sm",
                    state === "done" && "text-muted-foreground",
                    state === "active" && "font-medium text-foreground",
                  )}
                >
                  {line}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-10 flex justify-end">
          <Button
            size="lg"
            disabled={!done}
            onClick={() => navigate({ to: "/onboarding/subscription" })}
            className="gap-2"
          >
            {done ? "Choose a plan" : "Please wait…"}
          </Button>
        </div>
      </div>
    </OnboardingShell>
  );
}
