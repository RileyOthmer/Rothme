import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CreditCard, ExternalLink, AlertTriangle, Sparkles } from "lucide-react";
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

  const { subscription, loading, isActive, isPastDue, isCancelling } = useSubscription(userId);

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
    ? "ROTHME Pro — Annual ($470/year)"
    : subscription?.price_id === "pro_monthly"
      ? "ROTHME Pro — Monthly ($49/month)"
      : "Free";

  const renews = subscription?.current_period_end
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
            Stripe is automatically retrying your last payment. Your Pro features stay active — update your card in the portal to avoid interruption.
          </div>
        </div>
      )}

      {isCancelling && renews && (
        <div className="rounded-lg border border-border/70 bg-card p-4 text-sm">
          Your subscription will end on <strong>{renews}</strong>. You'll keep Pro access until then.
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
            <div className="mt-1 text-2xl font-semibold">{planLabel}</div>
            {isActive && renews && (
              <div className="mt-1 text-sm text-muted-foreground">
                {isCancelling ? "Ends" : "Renews"} on {renews}
              </div>
            )}
            {!loading && !isActive && (
              <div className="mt-1 text-sm text-muted-foreground">Upgrade to unlock the full ROTHME platform.</div>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {isActive ? (
            <>
              <button
                onClick={openPortal}
                disabled={portalLoading}
                className="inline-flex items-center gap-2 rounded-lg border border-border/70 px-4 py-2 text-sm hover:bg-muted/50 disabled:opacity-50"
              >
                <CreditCard className="h-4 w-4" />
                {portalLoading ? "Opening…" : "Manage subscription"}
                <ExternalLink className="h-3 w-3" />
              </button>
              <button
                onClick={openPortal}
                disabled={portalLoading}
                className="inline-flex items-center gap-2 rounded-lg border border-border/70 px-4 py-2 text-sm hover:bg-muted/50 disabled:opacity-50"
              >
                View invoices <ExternalLink className="h-3 w-3" />
              </button>
            </>
          ) : (
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm text-background hover:opacity-90"
            >
              See plans
            </Link>
          )}
        </div>
        {portalError && <p className="mt-3 text-sm text-red-600">{portalError}</p>}
      </section>

      <p className="text-xs text-muted-foreground">
        Billing is powered by Stripe. Cancel anytime — you'll keep Pro access until your current period ends.
      </p>
    </div>
  );
}
