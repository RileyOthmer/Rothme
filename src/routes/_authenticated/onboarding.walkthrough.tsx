import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, BarChart3, Calendar, LayoutDashboard, MessageSquare, Send, Settings, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { getOnboardingSession, saveOnboardingStep } from "@/lib/onboarding/session.functions";

export const Route = createFileRoute("/_authenticated/onboarding/walkthrough")({
  head: () => ({ meta: [{ title: "Tour ROTHME — ROTHME" }, { name: "robots", content: "noindex" }] }),
  component: WalkthroughStep,
});

const TOUR = [
  { icon: LayoutDashboard, title: "Dashboard", copy: "Your marketing health at a glance, updated daily." },
  { icon: BarChart3, title: "Analytics", copy: "Every platform's numbers, unified and translated." },
  { icon: Calendar, title: "Calendar", copy: "See what's scheduled across every channel." },
  { icon: Send, title: "Publishing", copy: "Write once, post everywhere." },
  { icon: MessageSquare, title: "AI Assistant", copy: "Ask anything about your marketing. In plain English." },
  { icon: Sparkles, title: "Reports", copy: "A briefing lands automatically every Monday." },
  { icon: Settings, title: "Settings", copy: "Manage integrations, team, and billing." },
];

function WalkthroughStep() {
  const navigate = useNavigate();
  const getSession = useServerFn(getOnboardingSession);
  const save = useServerFn(saveOnboardingStep);
  const { data: session } = useQuery({ queryKey: ["onboarding-session"], queryFn: () => getSession() });

  const next = async () => {
    await save({ data: { step: "first-success" } }).catch(() => {});
    navigate({ to: "/onboarding/first-success" });
  };

  return (
    <OnboardingShell currentStepId="walkthrough" session={session ?? null}>
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Here's what you have.</h1>
        <p className="mt-3 text-muted-foreground">A quick tour so nothing surprises you later.</p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {TOUR.map((t) => (
            <div key={t.title} className="flex items-start gap-3 rounded-2xl border border-border/50 bg-card/50 p-4 backdrop-blur-xl">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <t.icon className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-medium">{t.title}</div>
                <p className="mt-0.5 text-xs text-muted-foreground">{t.copy}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex justify-end">
          <Button size="lg" onClick={next} className="gap-2">Almost done<ArrowRight className="h-4 w-4" /></Button>
        </div>
      </div>
    </OnboardingShell>
  );
}
