import { createFileRoute } from "@tanstack/react-router";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { type StripeEnv, createStripeClient, verifyWebhook, getStripeEnvironmentFromKey, slugFromPriceId } from "@/lib/stripe.server";

let _supabase: SupabaseClient<Database> | null = null;
function getSupabase(): SupabaseClient<Database> {
  if (!_supabase) {
    _supabase = createClient<Database>(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }
  return _supabase;
}

function ts(sec?: number | null) {
  return sec ? new Date(sec * 1000).toISOString() : null;
}

async function applyPlanToOrg(
  orgId: string,
  plan: "pro" | "free",
  status: string,
  renewsAt: string | null,
  customerId: string | null,
) {
  const supabase = getSupabase();
  const patch = {
    plan,
    plan_status: status,
    plan_renews_at: renewsAt,
    updated_at: new Date().toISOString(),
    ...(customerId ? { stripe_customer_id: customerId } : {}),
  };
  await supabase.from("organizations").update(patch).eq("id", orgId);
}

async function logActivity(
  orgId: string | null,
  userId: string | null,
  verb: string,
  summary: string,
  metadata: Record<string, unknown>,
) {
  if (!orgId || !userId) return;
  try {
    await getSupabase().from("activity_events").insert({
      org_id: orgId,
      actor_id: userId,
      verb,
      summary,
      subject_type: "subscription",
      metadata: metadata as never,
    });
  } catch (e) {
    console.warn("activity log failed", e);
  }
}

function billingCycleFromPrice(price: any): "monthly" | "annual" | null {
  const interval = price?.recurring?.interval;
  const count = price?.recurring?.interval_count ?? 1;
  if (interval === "month" && count === 1) return "monthly";
  if (interval === "year" && count === 1) return "annual";
  if (interval === "month" && count === 12) return "annual";
  return null;
}

async function handleSubscriptionUpsert(subscription: any, env: StripeEnv, customerEmail?: string | null) {
  const userId: string | undefined = subscription.metadata?.userId;
  const orgId: string | undefined = subscription.metadata?.orgId;
  if (!userId) {
    console.error("subscription without userId metadata", subscription.id);
    return;
  }
  const item = subscription.items?.data?.[0];
  const rawPriceId = item?.price?.id;
  const priceId = item?.price?.lookup_key
    || item?.price?.metadata?.lovable_external_id
    || slugFromPriceId(rawPriceId)
    || rawPriceId;
  const productId = item?.price?.product;
  const periodStart = item?.current_period_start ?? subscription.current_period_start;
  const periodEnd = item?.current_period_end ?? subscription.current_period_end;
  const billingCycle = billingCycleFromPrice(item?.price);
  const active = ["active", "trialing", "past_due"].includes(subscription.status);

  await getSupabase().from("subscriptions").upsert({
    user_id: userId,
    org_id: orgId ?? null,
    stripe_subscription_id: subscription.id,
    stripe_customer_id: subscription.customer,
    product_id: productId,
    price_id: priceId,
    status: subscription.status,
    subscription_status: active ? "active" : subscription.status,
    plan: active ? "Rothme Pro" : "free",
    billing_cycle: billingCycle,
    customer_email: customerEmail ?? null,
    subscription_started_at: ts(subscription.start_date ?? subscription.created),
    next_billing_date: ts(periodEnd),
    current_period_start: ts(periodStart),
    current_period_end: ts(periodEnd),
    cancel_at_period_end: !!subscription.cancel_at_period_end,
    environment: env,
    updated_at: new Date().toISOString(),
  }, { onConflict: "stripe_subscription_id" });

  if (orgId) {
    await applyPlanToOrg(
      orgId,
      active ? "pro" : "free",
      subscription.status,
      ts(periodEnd),
      subscription.customer as string,
    );
  }
}

async function handleSubscriptionDeleted(subscription: any, env: StripeEnv) {
  const periodEnd = subscription.items?.data?.[0]?.current_period_end ?? subscription.current_period_end;
  await getSupabase()
    .from("subscriptions")
    .update({
      status: "canceled",
      current_period_end: ts(periodEnd),
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", subscription.id)
    .eq("environment", env);

  const orgId: string | undefined = subscription.metadata?.orgId;
  const userId: string | undefined = subscription.metadata?.userId;
  if (orgId) {
    const periodEndMs = periodEnd ? periodEnd * 1000 : 0;
    const stillGrace = periodEndMs > Date.now();
    await applyPlanToOrg(
      orgId,
      stillGrace ? "pro" : "free",
      "canceled",
      ts(periodEnd),
      subscription.customer as string,
    );
    await logActivity(orgId, userId ?? null, "subscription.canceled",
      "Pro subscription canceled — access continues until period end",
      { subscription_id: subscription.id, access_until: ts(periodEnd) });
  }
}

async function handleCheckoutCompleted(session: any, env: StripeEnv) {
  const orgId: string | undefined = session.metadata?.orgId;
  const userId: string | undefined = session.metadata?.userId;

  // Idempotent fallback: don't wait for customer.subscription.created.
  // Fetch the subscription now and upsert so entitlement activates
  // even if event ordering slips.
  if (session.mode === "subscription" && session.subscription) {
    try {
      const stripe = createStripeClient(env);
      const sub = await stripe.subscriptions.retrieve(session.subscription as string, {
        expand: ["items.data.price"],
      });
      // Merge session metadata onto the subscription object so downstream
      // handler picks up userId/orgId even if Stripe hasn't propagated yet.
      const merged = {
        ...sub,
        metadata: { ...(sub.metadata ?? {}), ...(session.metadata ?? {}) },
      };
      await handleSubscriptionUpsert(merged, env);
    } catch (e) {
      console.warn("checkout.session.completed: subscription fetch failed", e);
    }
  }

  await logActivity(orgId ?? null, userId ?? null, "subscription.activated",
    "ROTHME Pro activated",
    { session_id: session.id, amount_total: session.amount_total, currency: session.currency });
}

async function handleInvoicePaymentSucceeded(invoice: any, env: StripeEnv) {
  const subId = invoice.subscription;
  if (!subId) return;
  // Clear past_due proactively; also captures renewal-succeeded case.
  await getSupabase()
    .from("subscriptions")
    .update({ status: "active", updated_at: new Date().toISOString() })
    .eq("stripe_subscription_id", subId)
    .eq("environment", env)
    .eq("status", "past_due");
}

async function handleInvoicePaymentFailed(invoice: any, env: StripeEnv) {
  const subId = invoice.subscription;
  if (!subId) return;
  await getSupabase()
    .from("subscriptions")
    .update({ status: "past_due", updated_at: new Date().toISOString() })
    .eq("stripe_subscription_id", subId)
    .eq("environment", env);
}

async function handleWebhook(req: Request, env: StripeEnv) {
  const event = await verifyWebhook(req, env);
  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(event.data.object, env);
      break;
    case "customer.subscription.created":
    case "customer.subscription.updated":
      await handleSubscriptionUpsert(event.data.object, env);
      break;
    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(event.data.object, env);
      break;
    case "invoice.payment_succeeded":
      await handleInvoicePaymentSucceeded(event.data.object, env);
      break;
    case "invoice.payment_failed":
      await handleInvoicePaymentFailed(event.data.object, env);
      break;
    default:
      console.log("Unhandled event:", event.type);
  }
}

export const Route = createFileRoute("/api/public/payments/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // BYOK Stripe: env is derived from the configured secret key
        // (test vs live) instead of a ?env= query param, since one project
        // uses one Stripe account at a time.
        let env: StripeEnv;
        try {
          env = getStripeEnvironmentFromKey();
        } catch (e) {
          console.error("Webhook: STRIPE_SECRET_KEY not configured", e);
          return new Response("Stripe not configured", { status: 500 });
        }
        try {
          await handleWebhook(request, env);
          return Response.json({ received: true });
        } catch (e) {
          console.error("Webhook error:", e);
          return new Response("Webhook error", { status: 400 });
        }
      },
    },
  },
});
