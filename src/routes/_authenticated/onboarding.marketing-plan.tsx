import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Calendar, Target, TrendingUp, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { getOnboardingSession, saveOnboardingStep } from "@/lib/onboarding/session.functions";

export const Route = createFileRoute("/_authenticated/onboarding/marketing-plan")({
  head: () => ({ meta: [{ title: "Your first plan — Velora" }, { name: "robots", content: "noindex" }] }),
  component: MarketingPlanStep,
});

function MarketingPlanStep() {
  const navigate = useNavigate();
  const getSession = useServerFn(getOnboardingSession);
  const save = useServerFn(saveOnboardingStep);
  const { data: session } = useQuery({ queryKey: ["onboarding-session"], queryFn: () => getSession() });

  const analysis = session?.analysis;
  const bizName = (session?.answers?.businessName as string) ?? "your business";

  const next = async () => {
    await save({ data: { step: "walkthrough", checklist: { first_campaign_generated: true } } }).catch(() => {});
    navigate({ to: "/onboarding/walkthrough" });
  };

  return (
    <OnboardingShell currentStepId="marketing-plan" session={session ?? null}>
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Velora's first plan for {bizName}.</h1>
        <p className="mt-3 text-muted-foreground">
          {analysis?.summary ?? "A starting point you can refine any time. Nothing here is locked in."}
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Card icon={<Target className="h-4 w-4" />} title="Strategy">
            Focus this quarter on the platforms where your audience already spends time. Publish twice a week per platform with clear calls to action.
          </Card>
          <Card icon={<Calendar className="h-4 w-4" />} title="90-day roadmap">
            <ol className="list-decimal space-y-1 pl-4">
              <li>Month 1: baseline + fast wins</li>
              <li>Month 2: double down on what worked</li>
              <li>Month 3: automate + scale</li>
            </ol>
          </Card>
          <Card icon={<Zap className="h-4 w-4" />} title="Campaign ideas">
            <ul className="space-y-1">
              <li>· Behind-the-scenes series</li>
              <li>· Customer story of the week</li>
              <li>· Educational thread on your niche</li>
            </ul>
          </Card>
          <Card icon={<TrendingUp className="h-4 w-4" />} title="KPIs Velora will watch">
            <ul className="space-y-1">
              <li>· Engagement per post</li>
              <li>· New followers per week</li>
              <li>· Traffic that converts</li>
            </ul>
          </Card>
        </div>

        <div className="mt-10 flex justify-end">
          <Button size="lg" onClick={next} className="gap-2">Take the tour<ArrowRight className="h-4 w-4" /></Button>
        </div>
      </div>
    </OnboardingShell>
  );
}

function Card({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/50 bg-card/50 p-5 backdrop-blur-xl">
      <div className="mb-2 flex items-center gap-2 text-sm font-medium">
        <span className="text-primary">{icon}</span>
        {title}
      </div>
      <div className="text-sm leading-relaxed text-muted-foreground">{children}</div>
    </div>
  );
}
