import { createServerFn } from "@tanstack/react-start";
import type Stripe from "stripe";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { type StripeEnv, createStripeClient, getStripeErrorMessage, resolvePriceId } from "@/lib/stripe.server";

type CheckoutSessionResult = { clientSecret: string } | { error: string };
type PortalSessionResult = { url: string } | { error: string };



async function resolveOrCreateCustomer(
  stripe: ReturnType<typeof createStripeClient>,
  options: { email?: string; userId?: string; orgId?: string },
): Promise<string> {
  if (options.userId && !/^[a-zA-Z0-9_-]+$/.test(options.userId)) {
    throw new Error("Invalid userId");
  }
  if (options.userId) {
    const found = await stripe.customers.search({
      query: `metadata['userId']:'${options.userId}'`,
      limit: 1,
    });
    if (found.data.length) return found.data[0].id;
  }
  if (options.email) {
    const existing = await stripe.customers.list({ email: options.email, limit: 1 });
    if (existing.data.length) {
      const customer = existing.data[0];
      if (options.userId && customer.metadata?.userId !== options.userId) {
        await stripe.customers.update(customer.id, {
          metadata: {
            ...customer.metadata,
            userId: options.userId,
            ...(options.orgId && { orgId: options.orgId }),
          },
        });
      }
      return customer.id;
    }
  }
  const created = await stripe.customers.create({
    ...(options.email && { email: options.email }),
    metadata: {
      ...(options.userId && { userId: options.userId }),
      ...(options.orgId && { orgId: options.orgId }),
    },
  });
  return created.id;
}

export const createCheckoutSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: {
    priceId: string;
    returnUrl: string;
    environment: StripeEnv;
    orgId?: string;
  }) => {
    if (!/^[a-zA-Z0-9_-]+$/.test(data.priceId)) throw new Error("Invalid priceId");
    if (data.environment !== "sandbox" && data.environment !== "live") {
      throw new Error("Invalid environment");
    }
    return data;
  })
  .handler(async ({ data, context }): Promise<CheckoutSessionResult> => {
    try {
      const stripe = createStripeClient(data.environment);
      const { userId, supabase } = context;

      // Load user email + active org
      const { data: profile } = await supabase
        .from("profiles")
        .select("active_org_id")
        .eq("id", userId)
        .maybeSingle();
      const orgId = data.orgId || profile?.active_org_id || undefined;
      const { data: userRes } = await supabase.auth.getUser();
      const email = userRes?.user?.email ?? undefined;

      // Idempotency: if this org already has an active/trialing subscription,
      // don't create a duplicate — send the caller to the portal via error.
      if (orgId) {
        const { data: existing } = await supabase
          .from("subscriptions")
          .select("status")
          .eq("org_id", orgId)
          .eq("environment", data.environment)
          .in("status", ["active", "trialing", "past_due"])
          .limit(1)
          .maybeSingle();
        if (existing) {
          return { error: "You already have an active subscription. Manage it from Settings → Billing." };
        }
      }

      const resolvedPriceId = resolvePriceId(data.priceId);
      const stripePrice = await stripe.prices.retrieve(resolvedPriceId);
      if (!stripePrice) throw new Error("Price not found");

      const customerId = await resolveOrCreateCustomer(stripe, {
        email,
        userId,
        orgId: orgId ?? undefined,
      });

      const sessionParams: Stripe.Checkout.SessionCreateParams = {
        line_items: [{ price: stripePrice.id, quantity: 1 }],
        mode: "subscription",
        ui_mode: "embedded_page",
        return_url: data.returnUrl,
        customer: customerId,
        allow_promotion_codes: true,
        metadata: {
          userId,
          ...(orgId && { orgId }),
        },
        subscription_data: {
          metadata: {
            userId,
            ...(orgId && { orgId }),
          },
        },
      };

      const session = await stripe.checkout.sessions.create(sessionParams);

      return { clientSecret: session.client_secret ?? "" };
    } catch (error) {
      return { error: getStripeErrorMessage(error) };
    }
  });

export const createPortalSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { returnUrl?: string; environment: StripeEnv; flow?: "cancel" | "invoices" | "payment_method" }) => {
    if (data.environment !== "sandbox" && data.environment !== "live") {
      throw new Error("Invalid environment");
    }
    return data;
  })
  .handler(async ({ data, context }): Promise<PortalSessionResult> => {
    try {
      const { supabase, userId } = context;
      const found = await getActiveCustomerAndSub(supabase, userId, data.environment);
      if (!found) {
        return { error: "No subscription found. Start one from the pricing page." };
      }
      const stripe = createStripeClient(data.environment);
      const portal = await stripe.billingPortal.sessions.create({
        customer: found.customerId,
        ...(data.returnUrl && { return_url: data.returnUrl }),
      });
      return { url: portal.url };
    } catch (error) {
      return { error: getStripeErrorMessage(error) };
    }
  });

