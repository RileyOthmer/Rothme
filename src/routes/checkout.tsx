import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { StripeEmbeddedCheckout } from "@/components/StripeEmbeddedCheckout";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { Wordmark } from "@/components/brand/Wordmark";
import { supabase } from "@/integrations/supabase/client";
import { isPaymentsConfigured } from "@/lib/stripe";

const searchSchema = z.object({
  plan: z.enum(["pro_monthly"]).default("pro_monthly"),
});

export const Route = createFileRoute("/checkout")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Checkout — ROTHME" },
      {
        name: "description",
        content:
          "Complete your ROTHME subscription — $200/month for unlimited AI strategist, unified analytics, publishing, and automations across every connected platform.",
      },
      { property: "og:title", content: "Checkout — ROTHME" },
      {
        property: "og:description",
        content: "Subscribe to ROTHME and unlock your full AI marketing workspace.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { plan } = Route.useSearch();
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate({ to: "/auth", search: { redirect: `/checkout?plan=${plan}` } as never });
        return;
      }
      setUserEmail(data.session.user.email ?? null);
      setReady(true);
    })();
  }, [navigate, plan]);

  const planLabel = "Rothme Monthly Subscription ($200/mo)";

  if (!isPaymentsConfigured()) {
    return (
      <div className="mx-auto max-w-lg p-8 text-center">
        <h1 className="text-2xl font-semibold">Payments unavailable</h1>
        <p className="mt-2 text-muted-foreground">Stripe isn't configured for this environment yet.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PaymentTestModeBanner />
      <header className="border-b border-border/70">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4 sm:px-6">
          <Link to="/"><Wordmark /></Link>
          <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground">← Back to pricing</Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_1.4fr]">
        <aside className="rounded-xl border border-border/70 bg-card p-6">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">You're subscribing to</div>
          <div className="mt-1 text-lg font-semibold">{planLabel}</div>
          {userEmail && <div className="mt-4 text-sm text-muted-foreground">Signed in as {userEmail}</div>}
          <div className="mt-6 space-y-2 text-sm text-muted-foreground">
            <p>✓ Cancel anytime from Settings → Billing</p>
            <p>✓ Instant access to all features</p>
          </div>
        </aside>

        <main>
          {ready && <StripeEmbeddedCheckout priceId={plan} />}
        </main>
      </div>
    </div>
  );
}
