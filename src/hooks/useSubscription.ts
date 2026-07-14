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

export function useSubscription(userId: string | null | undefined) {
  const [subscription, setSubscription] = useState<SubscriptionRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !isPaymentsConfigured()) {
      setLoading(false);
      return;
    }
    const env = getStripeEnvironment();
    let cancelled = false;

    const load = async () => {
      const { data } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", userId)
        .eq("environment", env)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!cancelled) {
        setSubscription((data as SubscriptionRow | null) ?? null);
        setLoading(false);
      }
    };
    load();

    const channel = supabase
      .channel(`subs:${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "subscriptions", filter: `user_id=eq.${userId}` },
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
  const isPastDue = subscription?.status === "past_due";
  const isCancelling = !!subscription?.cancel_at_period_end && subscription.status !== "canceled";

  return { subscription, loading, isActive, isPastDue, isCancelling };
}
