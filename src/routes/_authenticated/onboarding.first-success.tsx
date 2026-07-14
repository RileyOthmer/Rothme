import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { PartyPopper, Send, Sparkles, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import {
  completeOnboarding,
  getOnboardingSession,
  saveOnboardingStep,
} from "@/lib/onboarding/session.functions";
import { updateProfile } from "@/lib/profile.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/onboarding/first-success")({
  head: () => ({ meta: [{ title: "Your first win — ROTHME" }, { name: "robots", content: "noindex" }] }),
  component: FirstSuccessStep,
});

const ACTIONS = [
  { id: "campaign", icon: Sparkles, label: "Generate my first AI campaign", checklist: "first_campaign_generated" },
  { id: "schedule", icon: Send, label: "Schedule my first post", checklist: "first_post_scheduled" },
  { id: "team", icon: Users, label: "Invite a teammate", checklist: "team_invited" },
  { id: "automate", icon: Zap, label: "Turn on a weekly report", checklist: "dashboard_complete" },
];

function FirstSuccessStep() {
  const navigate = useNavigate();
  const getSession = useServerFn(getOnboardingSession);
  const save = useServerFn(saveOnboardingStep);
  const complete = useServerFn(completeOnboarding);
  const saveProfile = useServerFn(updateProfile);
  const { data: session } = useQuery({ queryKey: ["onboarding-session"], queryFn: () => getSession() });

  const [celebrating, setCelebrating] = useState(false);

  const finish = useMutation({
    mutationFn: async (actionId: string) => {
      const action = ACTIONS.find((a) => a.id === actionId);
      await save({ data: { checklist: { [action!.checklist]: true, dashboard_complete: true } } }).catch(() => {});
      await complete().catch(() => {});
      await saveProfile({ data: { mark_onboarded: true } }).catch(() => {});
    },
    onSuccess: () => {
      setCelebrating(true);
      setTimeout(() => navigate({ to: "/dashboard", replace: true }), 1600);
    },
  });

  return (
    <OnboardingShell currentStepId="first-success" session={session ?? null}>
      <div className="mx-auto max-w-2xl">
        {!celebrating ? (
          <>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Pick your first win.</h1>
            <p className="mt-3 text-muted-foreground">One action, and ROTHME is officially working for you.</p>

            <div className="mt-8 space-y-3">
              {ACTIONS.map((a) => (
                <button
                  key={a.id}
                  disabled={finish.isPending}
                  onClick={() => finish.mutate(a.id)}
                  className={cn(
                    "group flex w-full items-center gap-4 rounded-2xl border border-border/50 bg-card/50 p-4 text-left backdrop-blur-xl transition-all",
                    "hover:border-primary/50 hover:bg-primary/5",
                    finish.isPending && finish.variables === a.id && "border-primary bg-primary/10",
                  )}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <a.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 font-medium">{a.label}</div>
                  <span className="text-xs text-muted-foreground group-hover:text-primary">→</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
            <div className="relative mb-8">
              <div className="absolute inset-0 -z-10 animate-ping rounded-full bg-primary/30 blur-2xl" />
              <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-primary/60 shadow-2xl">
                <PartyPopper className="h-12 w-12 text-primary-foreground" />
              </div>
            </div>
            <h2 className="text-3xl font-semibold tracking-tight">You're all set.</h2>
            <p className="mt-3 text-muted-foreground">Taking you to your dashboard…</p>
          </div>
        )}
      </div>
    </OnboardingShell>
  );
}
