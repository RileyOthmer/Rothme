import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Check, Sparkles, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { StripeEmbeddedCheckout } from "@/components/StripeEmbeddedCheckout";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import { isPaymentsConfigured } from "@/lib/stripe";
import { getOnboardingSession, saveOnboardingStep } from "@/lib/onboarding/session.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/onboarding/subscription")({
  head: () => ({ meta: [{ title: "Start your trial — ROTHME" }, { name: "robots", content: "noindex" }] }),
  component: SubscriptionStep,
});

function SubscriptionStep() {
  const navigate = useNavigate();
  const getSession = useServerFn(getOnboardingSession);
  const save = useServerFn(saveOnboardingStep);
  const { data: session } = useQuery({ queryKey: ["onboarding-session"], queryFn: () => getSession() });

  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);
  const { isActive, loading } = useSubscription(userId);

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const priceId = "pro_monthly";

  // Skip step entirely if org already active
  useEffect(() => {
    if (!loading && isActive) {
      save({ data: { step: "configuration" } }).catch(() => {});
      navigate({ to: "/onboarding/configuration" });
    }
  }, [loading, isActive, navigate, save]);

  const skipTrial = async () => {
    await save({ data: { step: "configuration" } }).catch(() => {});
    navigate({ to: "/onboarding/configuration" });
  };

  return (
    <OnboardingShell currentStepId="subscription" session={session ?? null}>
      <div className="mx-auto max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/50 px-3 py-1 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5" /> 7-day free trial · Cancel anytime
        </div>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Start your ROTHME Pro trial.</h1>
        <p className="mt-3 text-muted-foreground">
          Full access for 7 days. No charge until day 8 — cancel from Settings → Billing anytime.
        </p>

        {!checkoutOpen ? (
          <>
            <div className="mt-8 inline-flex rounded-full border border-border/60 bg-card/50 p-1 backdrop-blur-xl">
              <button
                onClick={() => setCycle("monthly")}
                className={cn("rounded-full px-4 py-1.5 text-sm transition-all", cycle === "monthly" && "bg-primary text-primary-foreground")}
              >
                Monthly
              </button>
              <button
                onClick={() => setCycle("annual")}
                className={cn("rounded-full px-4 py-1.5 text-sm transition-all", cycle === "annual" && "bg-primary text-primary-foreground")}
              >
                Annual · save ~17%
              </button>
            </div>

            <div className="mt-6 rounded-2xl border border-primary/40 bg-gradient-to-br from-primary/10 to-transparent p-6">
              <div className="flex items-baseline justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">ROTHME Pro</div>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-4xl font-semibold tracking-tight">
                      ${cycle === "monthly" ? 49 : 490}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      /{cycle === "monthly" ? "month" : "year"}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {cycle === "annual" ? "Two months free vs monthly ($588)" : "Billed monthly. Cancel anytime."}
                  </div>
                </div>
                <div className="hidden sm:block text-xs text-muted-foreground text-right">
                  Charged after your 7-day trial
                </div>
              </div>

              <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                {[
                  "Unified analytics across every connected platform",
                  "AI strategist with plain-English explanations",
                  "Unlimited connectors, decisions, and reports",
                  "All future Pro features included",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5" /> Secure checkout by Stripe · Test mode active in preview
              </div>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={skipTrial}>Skip for now</Button>
                <Button size="lg" onClick={() => setCheckoutOpen(true)} disabled={!isPaymentsConfigured()} className="gap-2">
                  Start 7-day trial <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {!isPaymentsConfigured() && (
              <p className="mt-4 text-xs text-muted-foreground">
                Payments aren't configured for this build. Skip for now — an admin will complete Stripe setup.
              </p>
            )}
          </>
        ) : (
          <div className="mt-8 rounded-2xl border border-border/70 bg-card p-4">
            <PaymentTestModeBanner />
            <div className="mb-3 flex items-center justify-between text-sm">
              <div className="text-muted-foreground">
                Starting trial: <strong className="text-foreground">ROTHME Pro — {cycle === "monthly" ? "Monthly" : "Annual"}</strong>
              </div>
              <button onClick={() => setCheckoutOpen(false)} className="text-muted-foreground hover:text-foreground">
                ← Back
              </button>
            </div>
            <StripeEmbeddedCheckout
              priceId={priceId}
              returnUrl={`${window.location.origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`}
            />
          </div>
        )}
      </div>
    </OnboardingShell>
  );
}
