import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  Clock,
  CreditCard,
  Download,
  ExternalLink,
  FileText,
  Receipt,
  Sparkles,
  XCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import { getStripeEnvironment, isPaymentsConfigured } from "@/lib/stripe";
import { createPortalSession, getBillingDetails } from "@/lib/payments.functions";

export const Route = createFileRoute("/_authenticated/settings/billing")({
  head: () => ({ meta: [{ title: "Billing — ROTHME" }, { name: "robots", content: "noindex" }] }),
  component: BillingPage,
});

type Invoice = {
  id: string;
  number: string | null;
  status: string | null;
  amount_paid: number;
  currency: string;
  created: string | null;
  hosted_invoice_url: string | null;
  pdf_url: string | null;
};

type PortalFlow = "cancel" | "invoices" | "payment_method" | undefined;

function BillingPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [busyFlow, setBusyFlow] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [card, setCard] = useState<{ brand: string | null; last4: string | null }>({ brand: null, last4: null });
  const [loadingBilling, setLoadingBilling] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  const { subscription, loading, isActive, isTrialing, isPastDue, isCancelling, trialEndsSoon } = useSubscription(userId);

  const refreshBilling = useCallback(async () => {
    if (!isActive) return;
    setLoadingBilling(true);
    try {
      const result = await getBillingDetails({ data: { environment: getStripeEnvironment() } });
      if ("error" in result) throw new Error(result.error);
      setInvoices(result.invoices);
      setCard({ brand: result.brand, last4: result.last4 });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load billing details");
    } finally {
      setLoadingBilling(false);
    }
  }, [isActive]);

  useEffect(() => {
    void refreshBilling();
  }, [refreshBilling]);

  const openPortal = async (flow: PortalFlow, label: string) => {
    setBusyFlow(label);
    setError(null);
    try {
      const result = await createPortalSession({
        data: {
          returnUrl: `${window.location.origin}/settings/billing`,
          environment: getStripeEnvironment(),
          flow,
        },
      });
      if ("error" in result) throw new Error(result.error);
      window.open(result.url, "_blank", "noopener");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to open Stripe portal");
    } finally {
      setBusyFlow(null);
    }
  };

  const planLabel =
    subscription?.price_id === "pro_monthly"
      ? "Rothme — Monthly"
      : isActive
      ? "Rothme"
      : "Not subscribed";

  const planPrice =
    subscription?.price_id === "pro_monthly"
      ? "$200.00 / month"
      : null;


  const periodEnd = subscription?.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6">
      <div>
        <h1 className="text-2xl font-semibold">Billing</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your Rothme subscription, payment method, and invoices.
        </p>
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
            Stripe is retrying automatically. Update your card to avoid interruption.
          </div>
        </div>
      )}

      {isTrialing && trialEndsSoon && periodEnd && (
        <div className="flex items-start gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm">
          <Clock className="mt-0.5 h-4 w-4 flex-none text-primary" />
          <div>
            <div className="font-medium text-foreground">Trial ends soon</div>
            Your free trial ends on <strong>{periodEnd}</strong>.
          </div>
        </div>
      )}

      {isCancelling && periodEnd && (
        <div className="rounded-lg border border-border/70 bg-card p-4 text-sm">
          Your subscription will end on <strong>{periodEnd}</strong>. You'll keep full access until then.
        </div>
      )}

      {/* Current Plan */}
      <section className="rounded-xl border border-border/70 bg-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-foreground" />
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Current plan</div>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <div className="text-2xl font-semibold">{planLabel}</div>
              {isTrialing && (
                <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">Trial</span>
              )}
              {isActive && !isTrialing && !isCancelling && (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                  Active
                </span>
              )}
              {isCancelling && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                  Cancelling
                </span>
              )}
            </div>
            {planPrice && <div className="mt-1 text-sm text-muted-foreground">{planPrice}</div>}
            {isActive && periodEnd && (
              <div className="mt-3 text-sm text-muted-foreground">
                {isTrialing ? "Trial ends" : isCancelling ? "Ends" : "Renews"} on{" "}
                <span className="font-medium text-foreground">{periodEnd}</span>
              </div>
            )}
            {!loading && !isActive && (
              <div className="mt-3 text-sm text-muted-foreground">
                Complete your subscription to activate your Rothme workspace.
              </div>
            )}
          </div>
          {!isActive && !loading && (
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm text-background hover:opacity-90"
            >
              Subscribe
            </Link>
          )}
        </div>
      </section>


      {isActive && (
        <>
          {/* Payment Method */}
          <section className="rounded-xl border border-border/70 bg-card p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-foreground" />
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">Payment method</div>
                </div>
                <div className="mt-1 text-base font-medium">
                  {card.last4 ? (
                    <>
                      <span className="capitalize">{card.brand}</span> •••• {card.last4}
                    </>
                  ) : loadingBilling ? (
                    "Loading…"
                  ) : (
                    "No card on file"
                  )}
                </div>
              </div>
              <button
                onClick={() => openPortal("payment_method", "card")}
                disabled={busyFlow === "card"}
                className="inline-flex items-center gap-2 rounded-lg border border-border/70 px-3 py-2 text-sm hover:bg-muted/50 disabled:opacity-50"
              >
                {busyFlow === "card" ? "Opening…" : "Update card"}
                <ExternalLink className="h-3 w-3" />
              </button>
            </div>
          </section>

          {/* Actions */}
          <section className="grid gap-3 sm:grid-cols-2">
            <button
              onClick={() => openPortal(undefined, "portal")}
              disabled={busyFlow === "portal"}
              className="flex items-center justify-between rounded-xl border border-border/70 bg-card p-4 text-left hover:bg-muted/40 disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <Receipt className="h-5 w-5 text-foreground" />
                <div>
                  <div className="text-sm font-medium">Stripe Billing Portal</div>
                  <div className="text-xs text-muted-foreground">Manage everything in one place</div>
                </div>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </button>
            <button
              onClick={() => openPortal("cancel", "cancel")}
              disabled={busyFlow === "cancel" || isCancelling}
              className="flex items-center justify-between rounded-xl border border-border/70 bg-card p-4 text-left hover:bg-muted/40 disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <XCircle className="h-5 w-5 text-foreground" />
                <div>
                  <div className="text-sm font-medium">
                    {isCancelling ? "Cancellation scheduled" : "Cancel subscription"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {isCancelling ? "Ends " + periodEnd : "Keep access until the period ends"}
                  </div>
                </div>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </button>
          </section>

          {/* Invoices / History */}
          <section className="rounded-xl border border-border/70 bg-card">
            <div className="flex items-center justify-between border-b border-border/70 px-6 py-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-foreground" />
                <div>
                  <div className="text-sm font-medium">Billing history</div>
                  <div className="text-xs text-muted-foreground">Recent invoices from Stripe</div>
                </div>
              </div>
              <button
                onClick={() => void refreshBilling()}
                disabled={loadingBilling}
                className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
              >
                {loadingBilling ? "Refreshing…" : "Refresh"}
              </button>
            </div>
            {invoices.length === 0 ? (
              <div className="px-6 py-8 text-center text-sm text-muted-foreground">
                {loadingBilling ? "Loading invoices…" : "No invoices yet."}
              </div>
            ) : (
              <ul className="divide-y divide-border/60">
                {invoices.map((inv) => (
                  <li key={inv.id} className="flex items-center gap-4 px-6 py-3 text-sm">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium">
                        {inv.number ?? inv.id}
                        <span
                          className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
                            inv.status === "paid"
                              ? "bg-emerald-100 text-emerald-700"
                              : inv.status === "open"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {inv.status ?? "—"}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {inv.created
                          ? new Date(inv.created).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : ""}
                      </div>
                    </div>
                    <div className="text-sm font-medium tabular-nums">
                      {inv.amount_paid.toLocaleString(undefined, {
                        style: "currency",
                        currency: inv.currency.toUpperCase(),
                      })}
                    </div>
                    <div className="flex items-center gap-2">
                      {inv.hosted_invoice_url && (
                        <a
                          href={inv.hosted_invoice_url}
                          target="_blank"
                          rel="noopener"
                          className="inline-flex items-center gap-1 rounded-md border border-border/70 px-2 py-1 text-xs hover:bg-muted/50"
                          title="View invoice"
                        >
                          View
                        </a>
                      )}
                      {inv.pdf_url && (
                        <a
                          href={inv.pdf_url}
                          target="_blank"
                          rel="noopener"
                          className="inline-flex items-center gap-1 rounded-md border border-border/70 px-2 py-1 text-xs hover:bg-muted/50"
                          title="Download PDF"
                        >
                          <Download className="h-3 w-3" />
                          PDF
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <p className="text-xs text-muted-foreground">
        Billing is powered by Stripe. Cancel anytime — you keep access until your current period ends.
      </p>
    </div>
  );
}
