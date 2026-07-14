import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Check, Shield } from "lucide-react";
import { useState } from "react";
import { Wordmark } from "@/components/brand/Wordmark";
import { supabase } from "@/integrations/supabase/client";

type BillingCycle = "monthly" | "annual";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Velora" },
      { name: "description", content: "One plan. Everything included. Monthly or annual — cancel anytime. Enterprise available." },
      { property: "og:title", content: "Pricing — Velora" },
      { property: "og:description", content: "Velora Pro — the complete AI business growth platform. Monthly or annual, cancel anytime." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PricingPage,
});

const PRO_FEATURES = [
  "AI Assistant — plain-English answers with evidence",
  "Unified analytics across every connected platform",
  "Publishing, scheduling & content calendar",
  "Weekly AI reports with recommendations",
  "Custom dashboards & goals",
  "Team collaboration, roles & approvals",
  "Unlimited connected accounts",
  "Priority support",
];

const ENTERPRISE_FEATURES = [
  "Everything in Pro",
  "SSO / SAML",
  "Custom integrations",
  "Dedicated success manager",
  "Compliance & security review",
  "SLA & audit logs",
];

function PricingPage() {
  const [cycle, setCycle] = useState<BillingCycle>("annual");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const monthlyPrice = 49;
  const annualPricePerMonth = 39; // 47000/12 ≈ 39.17
  const displayPrice = cycle === "monthly" ? monthlyPrice : annualPricePerMonth;
  const savings = Math.round((1 - annualPricePerMonth / monthlyPrice) * 100);

  const priceId = cycle === "monthly" ? "pro_monthly" : "pro_annual";

  const handleStart = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate({ to: "/auth", search: { redirect: `/checkout?plan=${priceId}` } as never });
        return;
      }
      navigate({ to: "/checkout", search: { plan: priceId } as never });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/70">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/"><Wordmark /></Link>
          <div className="flex items-center gap-4 text-sm">
            <Link to="/why" className="text-muted-foreground hover:text-foreground">Why Velora</Link>
            <Link to="/auth" className="text-muted-foreground hover:text-foreground">Sign in</Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">One plan. Everything you need to grow.</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Simple, transparent pricing. Cancel anytime. 14-day money-back guarantee.
          </p>

          <div className="mt-8 inline-flex items-center rounded-full border border-border/70 p-1 text-sm">
            <button
              onClick={() => setCycle("monthly")}
              className={`rounded-full px-4 py-1.5 transition ${cycle === "monthly" ? "bg-foreground text-background" : "text-muted-foreground"}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setCycle("annual")}
              className={`rounded-full px-4 py-1.5 transition ${cycle === "annual" ? "bg-foreground text-background" : "text-muted-foreground"}`}
            >
              Annual <span className="ml-1 text-xs opacity-80">save {savings}%</span>
            </button>
          </div>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {/* Pro */}
          <div className="relative rounded-2xl border-2 border-foreground bg-card p-8 shadow-sm">
            <div className="absolute -top-3 left-8 rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background">
              Most popular
            </div>
            <div>
              <h2 className="text-2xl font-semibold">Velora Pro</h2>
              <p className="mt-1 text-sm text-muted-foreground">Everything to run your business's growth.</p>
            </div>
            <div className="mt-6 flex items-baseline gap-2">
              <span className="text-5xl font-semibold tracking-tight">${displayPrice}</span>
              <span className="text-muted-foreground">/ month</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {cycle === "annual" ? "Billed annually ($470/year). Cancel anytime." : "Billed monthly. Cancel anytime."}
            </p>

            <button
              onClick={handleStart}
              disabled={loading}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-3 text-sm font-medium text-background transition hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Loading…" : "Start with Velora Pro"} <ArrowRight className="h-4 w-4" />
            </button>

            <ul className="mt-8 space-y-3">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm">
                  <Check className="mt-0.5 h-4 w-4 flex-none text-foreground" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Enterprise */}
          <div className="rounded-2xl border border-border/70 bg-card p-8">
            <div>
              <h2 className="text-2xl font-semibold">Enterprise</h2>
              <p className="mt-1 text-sm text-muted-foreground">For larger teams that need it all.</p>
            </div>
            <div className="mt-6 flex items-baseline gap-2">
              <span className="text-5xl font-semibold tracking-tight">Custom</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Volume pricing, SSO, and dedicated support.</p>

            <a
              href="mailto:sales@velora.app?subject=Enterprise%20inquiry"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border/70 px-4 py-3 text-sm font-medium hover:bg-muted/50"
            >
              Talk to sales <ArrowRight className="h-4 w-4" />
            </a>

            <ul className="mt-8 space-y-3">
              {ENTERPRISE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm">
                  <Check className="mt-0.5 h-4 w-4 flex-none text-foreground" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4" />
          Secure checkout by Stripe. 14-day money-back guarantee. Cancel in one click.
        </div>
      </section>
    </div>
  );
}
