import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { getOnboardingSession, saveOnboardingStep } from "@/lib/onboarding/session.functions";

export const Route = createFileRoute("/_authenticated/onboarding/welcome")({
  head: () => ({ meta: [{ title: "Welcome — Velora" }, { name: "robots", content: "noindex" }] }),
  component: WelcomeStep,
});

function WelcomeStep() {
  const navigate = useNavigate();
  const getSession = useServerFn(getOnboardingSession);
  const save = useServerFn(saveOnboardingStep);
  const { data: session } = useQuery({ queryKey: ["onboarding-session"], queryFn: () => getSession() });

  const start = async () => {
    await save({ data: { step: "discovery" } }).catch(() => {});
    navigate({ to: "/onboarding/discovery" });
  };

  return (
    <OnboardingShell currentStepId="welcome" session={session ?? null}>
      <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center text-center">
        <div className="relative mb-8">
          <div className="absolute inset-0 -z-10 rounded-full bg-primary/20 blur-3xl" />
          <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-primary/60 shadow-2xl shadow-primary/30">
            <Sparkles className="h-12 w-12 text-primary-foreground" />
          </div>
        </div>

        <h1 className="mb-4 text-balance text-5xl font-semibold tracking-tight sm:text-6xl">
          Welcome to Velora.
        </h1>
        <p className="mb-2 text-balance text-lg text-muted-foreground">
          Let's build your marketing workspace together.
        </p>
        <p className="mb-10 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
          <Clock className="h-3.5 w-3.5" /> This takes about 3 minutes.
        </p>

        <Button size="lg" onClick={start} className="group h-12 gap-2 px-8 text-base">
          Get started
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Button>

        <p className="mt-8 text-xs text-muted-foreground">
          You can pause and resume any time. Nothing is charged.
        </p>
      </div>
    </OnboardingShell>
  );
}
