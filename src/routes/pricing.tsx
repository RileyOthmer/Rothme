import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { Wordmark } from "@/components/brand/Wordmark";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Rothme" },
      { name: "description", content: "Choose the plan that's right for you. Every Rothme Pro subscription includes the complete platform — no feature tiers, no hidden upgrades." },
      { property: "og:title", content: "Pricing — Rothme" },
      { property: "og:description", content: "Everything you need to grow your business with AI." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PricingPage,
});

const PRO_FEATURES = [
  "Unlimited AI Marketing Assistant",
  "Unlimited AI Content Generation",
  "Connect all your social media accounts",
  "AI Campaign Builder",
  "Smart Scheduling & Publishing",
  "Advanced Analytics Dashboard",
  "Competitor Insights",
  "Marketing Calendar",
  "Brand Workspace",
  "File Storage",
  "Priority Support",
];

const INCLUDED_FEATURES = [
  "Unlimited platform access",
  "Unlimited AI usage*",
  "Unlimited connected social accounts",
  "Unlimited projects",
  "Secure cloud storage",
  "Automatic updates",
  "Access to all future Rothme Pro features",
];

const FAQ = [
  {
    q: "Can I cancel anytime?",
    a: "Yes. You can cancel from your billing settings at any time. Your subscription remains active through the end of the current billing period.",
  },
  {
    q: "Is my payment secure?",
    a: "Yes. All payments are securely processed by Stripe. Rothme never stores your full payment information.",
  },
  {
    q: "Are there contracts?",
    a: "No. Rothme Pro is a recurring subscription with no long-term commitment.",
  },
];

function PricingPage() {
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  const { subscription, isActive } = useSubscription(userId);
  const currentPlan = isActive ? subscription?.price_id : null;

  const handleStart = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.auth.getSession();
      const priceId = "pro_monthly";
      if (!data.session) {
        navigate({ to: "/auth", search: { redirect: `/checkout?plan=${priceId}` } as never });
        return;
      }
      // Already active — send to billing instead of duplicate checkout
      if (isActive) {
        navigate({ to: "/settings/billing" });
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
            <Link to="/why" className="text-muted-foreground hover:text-foreground">Why Rothme</Link>
            <Link to="/auth" className="text-muted-foreground hover:text-foreground">Sign in</Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Pricing</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Everything you need to grow your business with AI.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Choose the plan that's right for you. Every Rothme Pro subscription includes the complete platform — no feature tiers, no hidden upgrades.
          </p>
        </div>

        <div className="mt-12 grid gap-6">
          {/* Monthly */}
          <div className="mx-auto w-full max-w-md rounded-2xl border-2 border-foreground bg-card p-8 shadow-sm">
            <div>
              <h2 className="text-2xl font-semibold">Rothme Pro</h2>
              <p className="mt-1 text-sm text-muted-foreground">Monthly</p>
            </div>
            <div className="mt-6 flex items-baseline gap-2">
              <span className="text-5xl font-semibold tracking-tight">$200</span>
              <span className="text-muted-foreground">/ month</span>
            </div>

            <button
              onClick={() => handleStart("monthly")}
              disabled={loading}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-3 text-sm font-medium text-background transition hover:opacity-90 disabled:opacity-50"
            >
              {loading
                ? "Loading…"
                : currentPlan === "pro_monthly"
                  ? "Current plan — Manage"
                  : "Start Monthly"} <ArrowRight className="h-4 w-4" />
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
        </div>

        {/* Included with every subscription */}
        <div className="mt-16 rounded-2xl border border-border/70 bg-card p-8">
          <h3 className="text-xl font-semibold">Included with every subscription</h3>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {INCLUDED_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-3 text-sm text-muted-foreground">
                <Check className="mt-0.5 h-4 w-4 flex-none text-foreground" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-xs text-muted-foreground">
            *Subject to fair-use limits to ensure reliable service for all users.
          </p>
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <h3 className="text-2xl font-semibold">Frequently Asked Questions</h3>
          <dl className="mt-6 grid gap-6 sm:grid-cols-2">
            {FAQ.map(({ q, a }) => (
              <div key={q} className="rounded-xl border border-border/70 bg-card p-5">
                <dt className="font-medium text-foreground">{q}</dt>
                <dd className="mt-2 text-sm text-muted-foreground">{a}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-12 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Check className="h-4 w-4" />
          Secure checkout by Stripe. Cancel in one click.
        </div>
      </section>
    </div>
  );
}
