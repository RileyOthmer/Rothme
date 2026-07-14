import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { getOnboardingSession, saveOnboardingStep } from "@/lib/onboarding/session.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/onboarding/subscription")({
  head: () => ({ meta: [{ title: "Choose a plan — Velora" }, { name: "robots", content: "noindex" }] }),
  component: SubscriptionStep,
});

const TIERS = [
  { id: "starter", name: "Starter", price: 0, priceYear: 0, tag: "Free forever", features: ["1 workspace","3 connected platforms","Weekly AI report","Community support"] },
  { id: "professional", name: "Professional", price: 39, priceYear: 32, tag: "Most popular", features: ["Unlimited platforms","Full AI assistant","Automations","Priority support"], highlight: true },
  { id: "agency", name: "Agency", price: 129, priceYear: 99, tag: "For teams", features: ["Multi-workspace","Team roles + approvals","White-label reports","Dedicated onboarding"] },
  { id: "enterprise", name: "Enterprise", price: null, priceYear: null, tag: "Custom", features: ["SSO / SAML","Custom integrations","SLA","Named CSM"] },
];

function SubscriptionStep() {
  const navigate = useNavigate();
  const getSession = useServerFn(getOnboardingSession);
  const save = useServerFn(saveOnboardingStep);
  const { data: session } = useQuery({ queryKey: ["onboarding-session"], queryFn: () => getSession() });
  const [yearly, setYearly] = useState(true);
  const [selected, setSelected] = useState<string>(session?.plan_tier ?? "professional");

  const next = async () => {
    await save({ data: { step: "configuration", plan_tier: selected } }).catch(() => {});
    navigate({ to: "/onboarding/configuration" });
  };

  return (
    <OnboardingShell currentStepId="subscription" session={session ?? null}>
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Pick the plan that fits.</h1>
        <p className="mt-3 text-muted-foreground">Start free. Upgrade any time. 30-day money-back guarantee.</p>

        <div className="mt-6 inline-flex rounded-full border border-border/60 bg-card/50 p-1 backdrop-blur-xl">
          <button onClick={() => setYearly(false)} className={cn("rounded-full px-4 py-1.5 text-sm transition-all", !yearly && "bg-primary text-primary-foreground")}>Monthly</button>
          <button onClick={() => setYearly(true)} className={cn("rounded-full px-4 py-1.5 text-sm transition-all", yearly && "bg-primary text-primary-foreground")}>Yearly · save 20%</button>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {TIERS.map((t) => {
            const price = yearly ? t.priceYear : t.price;
            const on = selected === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setSelected(t.id)}
                className={cn(
                  "relative rounded-2xl border p-5 text-left transition-all",
                  on ? "border-primary shadow-lg shadow-primary/10" : "border-border/50 hover:border-border",
                  t.highlight && "bg-gradient-to-br from-primary/10 to-transparent",
                )}
              >
                <div className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">{t.tag}</div>
                <div className="text-lg font-semibold">{t.name}</div>
                <div className="mt-3 flex items-baseline gap-1">
                  {price === null ? (
                    <span className="text-2xl font-semibold">Let's talk</span>
                  ) : (
                    <>
                      <span className="text-3xl font-semibold tracking-tight">${price}</span>
                      <span className="text-sm text-muted-foreground">/mo</span>
                    </>
                  )}
                </div>
                <ul className="mt-4 space-y-1.5">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>

        <div className="mt-10 flex justify-end">
          <Button size="lg" onClick={next} className="gap-2">Continue<ArrowRight className="h-4 w-4" /></Button>
        </div>
      </div>
    </OnboardingShell>
  );
}
