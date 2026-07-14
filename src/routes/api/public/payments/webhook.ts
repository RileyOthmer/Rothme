import { createFileRoute } from "@tanstack/react-router";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { type StripeEnv, verifyWebhook } from "@/lib/stripe.server";

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

async function applyPlanToOrg(orgId: string, plan: "pro" | "free", status: string, renewsAt: string | null, customerId: string | null) {
  const supabase = getSupabase();
  const patch: Record<string, unknown> = {
    plan,
    plan_status: status,
    plan_renews_at: renewsAt,
    updated_at: new Date().toISOString(),
  };
  if (customerId) patch.stripe_customer_id = customerId;
  await supabase.from("organizations").update(patch).eq("id", orgId);
}

async function logActivity(orgId: string | null, userId: string | null, kind: string, payload: Record<string, unknown>) {
  if (!orgId) return;
  try {
    await getSupabase().from("activity_events").insert({
      org_id: orgId,
      actor_user_id: userId,
      kind,
      payload,
    });
  } catch (e) {
    console.warn("activity log failed", e);
  }
}

async function handleSubscriptionUpsert(subscription: any, env: StripeEnv) {
  const userId: string | undefined = subscription.metadata?.userId;
  const orgId: string | undefined = subscription.metadata?.orgId;
  if (!userId) {
    console.error("subscription without userId metadata", subscription.id);
    return;
  }
  const item = subscription.items?.data?.[0];
  const priceId = item?.price?.lookup_key
    || item?.price?.metadata?.lovable_external_id
    || item?.price?.id;
  const productId = item?.price?.product;
  const periodStart = item?.current_period_start ?? subscription.current_period_start;
  const periodEnd = item?.current_period_end ?? subscription.current_period_end;

  await getSupabase().from("subscriptions").upsert({
    user_id: userId,
    org_id: orgId ?? null,
    stripe_subscription_id: subscription.id,
    stripe_customer_id: subscription.customer,
    product_id: productId,
    price_id: priceId,
    status: subscription.status,
    current_period_start: ts(periodStart),
    current_period_end: ts(periodEnd),
    cancel_at_period_end: !!subscription.cancel_at_period_end,
    environment: env,
    updated_at: new Date().toISOString(),
  }, { onConflict: "stripe_subscription_id" });

  if (orgId) {
    const active = ["active", "trialing", "past_due"].includes(subscription.status);
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
    // Grace period: keep pro until period end. If already past, revoke.
    const periodEndMs = periodEnd ? periodEnd * 1000 : 0;
    const stillGrace = periodEndMs > Date.now();
    await applyPlanToOrg(
      orgId,
      stillGrace ? "pro" : "free",
      "canceled",
      ts(periodEnd),
      subscription.customer as string,
    );
    await logActivity(orgId, userId ?? null, "subscription.canceled", {
      subscription_id: subscription.id,
      access_until: ts(periodEnd),
    });
  }
}

async function handleCheckoutCompleted(session: any) {
  const orgId: string | undefined = session.metadata?.orgId;
  const userId: string | undefined = session.metadata?.userId;
  await logActivity(orgId ?? null, userId ?? null, "subscription.activated", {
    session_id: session.id,
    amount_total: session.amount_total,
    currency: session.currency,
  });
}

async function handleInvoicePaymentFailed(invoice: any) {
  const subId = invoice.subscription;
  if (!subId) return;
  await getSupabase()
    .from("subscriptions")
    .update({ status: "past_due", updated_at: new Date().toISOString() })
    .eq("stripe_subscription_id", subId);
}

async function handleWebhook(req: Request, env: StripeEnv) {
  const event = await verifyWebhook(req, env);
  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(event.data.object);
      break;
    case "customer.subscription.created":
    case "customer.subscription.updated":
      await handleSubscriptionUpsert(event.data.object, env);
      break;
    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(event.data.object, env);
      break;
    case "invoice.payment_failed":
      await handleInvoicePaymentFailed(event.data.object);
      break;
    default:
      console.log("Unhandled event:", event.type);
  }
}

export const Route = createFileRoute("/api/public/payments/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawEnv = new URL(request.url).searchParams.get("env");
        if (rawEnv !== "sandbox" && rawEnv !== "live") {
          console.error("Webhook received with invalid env:", rawEnv);
          return Response.json({ received: true, ignored: "invalid env" });
        }
        try {
          await handleWebhook(request, rawEnv);
          return Response.json({ received: true });
        } catch (e) {
          console.error("Webhook error:", e);
          return new Response("Webhook error", { status: 400 });
        }
      },
    },
  },
});
