import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CreditCard, ExternalLink, AlertTriangle, Sparkles, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import { getStripeEnvironment, isPaymentsConfigured } from "@/lib/stripe";
import { createPortalSession } from "@/lib/payments.functions";

export const Route = createFileRoute("/_authenticated/settings/billing")({
  head: () => ({ meta: [{ title: "Billing — ROTHME" }, { name: "robots", content: "noindex" }] }),
  component: BillingPage,
});

function BillingPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  const { subscription, loading, isActive, isTrialing, isPastDue, isCancelling, trialEndsSoon } = useSubscription(userId);

  const openPortal = async () => {
    setPortalLoading(true);
    setPortalError(null);
    try {
      const result = await createPortalSession({
        data: {
          returnUrl: `${window.location.origin}/settings/billing`,
          environment: getStripeEnvironment(),
        },
      });
      if ("error" in result) throw new Error(result.error);
      window.open(result.url, "_blank", "noopener");
    } catch (e) {
      setPortalError(e instanceof Error ? e.message : "Failed to open portal");
    } finally {
      setPortalLoading(false);
    }
  };

  const planLabel = subscription?.price_id === "pro_annual"
    ? "ROTHME Pro — Annual ($490/year)"
    : subscription?.price_id === "pro_monthly"
      ? "ROTHME Pro — Monthly ($49/month)"
      : "Free";

  const periodEnd = subscription?.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
    : null;

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6">
      <div>
        <h1 className="text-2xl font-semibold">Billing</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your ROTHME subscription, payment method, and invoices.</p>
      </div>

      {!isPaymentsConfigured() && (
        <div className="rounded-lg border border-border/70 bg-muted/40 p-4 text-sm">
          Payments aren't configured in this environment.
        </div>
      )}

      {isPastDue && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-none" />
          <div>
            <div className="font-medium">Payment failed</div>
            Stripe is retrying automatically. Pro features stay active — update your card to avoid interruption.
          </div>
        </div>
      )}

      {isTrialing && trialEndsSoon && periodEnd && (
        <div className="flex items-start gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm">
          <Clock className="mt-0.5 h-4 w-4 flex-none text-primary" />
          <div>
            <div className="font-medium text-foreground">Trial ends soon</div>
            Your free trial ends on <strong>{periodEnd}</strong>. You'll be charged automatically unless you cancel.
          </div>
        </div>
      )}

      {isCancelling && periodEnd && (
        <div className="rounded-lg border border-border/70 bg-card p-4 text-sm">
          Your subscription will end on <strong>{periodEnd}</strong>. You'll keep Pro access until then.
          <button onClick={openPortal} className="ml-2 underline">Reactivate</button>
        </div>
      )}

      <section className="rounded-xl border border-border/70 bg-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-foreground" />
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Current plan</div>
            </div>
            <div className="mt-1 text-2xl font-semibold">
              {planLabel}
              {isTrialing && <span className="ml-2 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">Trial</span>}
            </div>
            {isActive && periodEnd && (
              <div className="mt-1 text-sm text-muted-foreground">
                {isTrialing ? "Trial ends" : isCancelling ? "Ends" : "Renews"} on {periodEnd}
              </div>
            )}
            {!loading && !isActive && (
              <div className="mt-1 text-sm text-muted-foreground">Start your 7-day free trial to unlock the full ROTHME platform.</div>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {isActive ? (
            <button
              onClick={openPortal}
              disabled={portalLoading}
              className="inline-flex items-center gap-2 rounded-lg border border-border/70 px-4 py-2 text-sm hover:bg-muted/50 disabled:opacity-50"
            >
              <CreditCard className="h-4 w-4" />
              {portalLoading ? "Opening…" : "Manage subscription & invoices"}
              <ExternalLink className="h-3 w-3" />
            </button>
          ) : (
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm text-background hover:opacity-90"
            >
              Start free trial
            </Link>
          )}
        </div>
        {portalError && <p className="mt-3 text-sm text-red-600">{portalError}</p>}
      </section>

      <p className="text-xs text-muted-foreground">
        Billing is powered by Stripe. Cancel anytime — you keep Pro access until your current period ends.
      </p>
    </div>
  );
}
