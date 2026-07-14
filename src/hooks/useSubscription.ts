import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getStripeEnvironment, isPaymentsConfigured } from "@/lib/stripe";

export type SubscriptionRow = {
  id: string;
  user_id: string;
  org_id: string | null;
  stripe_subscription_id: string;
  stripe_customer_id: string;
  product_id: string;
  price_id: string;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean | null;
  environment: string;
};

/**
 * Reads the org-scoped subscription for the currently active organization.
 * All members of an org see the same entitlement. Falls back to the user's
 * own subscription rows when no active org is set (personal workspace).
 */
export function useSubscription(userId: string | null | undefined) {
  const [subscription, setSubscription] = useState<SubscriptionRow | null>(null);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !isPaymentsConfigured()) {
      setLoading(false);
      return;
    }
    const env = getStripeEnvironment();
    let cancelled = false;

    const load = async () => {
      // Resolve active org for this user
      const { data: profile } = await supabase
        .from("profiles")
        .select("active_org_id")
        .eq("id", userId)
        .maybeSingle();
      const activeOrg = (profile?.active_org_id as string | null) ?? null;

      let query = supabase
        .from("subscriptions")
        .select("*")
        .eq("environment", env)
        .order("created_at", { ascending: false })
        .limit(1);
      query = activeOrg
        ? query.eq("org_id", activeOrg)
        : query.eq("user_id", userId);

      const { data } = await query.maybeSingle();
      if (!cancelled) {
        setOrgId(activeOrg);
        setSubscription((data as SubscriptionRow | null) ?? null);
        setLoading(false);
      }
    };
    load();

    const channel = supabase
      .channel(`subs:${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "subscriptions" },
        () => load(),
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const now = Date.now();
  const periodEnd = subscription?.current_period_end ? new Date(subscription.current_period_end).getTime() : null;
  const isActive = !!subscription && (
    (["active", "trialing", "past_due"].includes(subscription.status) && (!periodEnd || periodEnd > now))
    || (subscription.status === "canceled" && periodEnd !== null && periodEnd > now)
  );
  const isTrialing = subscription?.status === "trialing";
  const isPastDue = subscription?.status === "past_due";
  const isCancelling = !!subscription?.cancel_at_period_end && subscription.status !== "canceled";
  const trialEndsSoon = isTrialing && periodEnd !== null && periodEnd - now < 3 * 24 * 3600 * 1000;

  return { subscription, orgId, loading, isActive, isTrialing, isPastDue, isCancelling, trialEndsSoon };
}
