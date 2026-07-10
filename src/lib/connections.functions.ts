import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const PROVIDERS = [
  "google_ads",
  "meta_ads",
  "ga4",
  "shopify",
  "mailchimp",
] as const;
export type Provider = (typeof PROVIDERS)[number];

export const PROVIDER_META: Record<Provider, { name: string; blurb: string }> = {
  google_ads: { name: "Google Ads", blurb: "Search and display advertising performance." },
  meta_ads: { name: "Meta Ads", blurb: "Facebook and Instagram ad results." },
  ga4: { name: "Google Analytics", blurb: "Website traffic and behavior." },
  shopify: { name: "Shopify", blurb: "Sales, orders, and revenue." },
  mailchimp: { name: "Mailchimp", blurb: "Email campaigns and open rates." },
};

export const listConnections = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("account_connections")
      .select("provider, connected_at")
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const providerSchema = z.object({ provider: z.enum(PROVIDERS) });

export const connectProvider = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => providerSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("account_connections")
      .upsert(
        { user_id: context.userId, provider: data.provider, connected_at: new Date().toISOString() },
        { onConflict: "user_id,provider" },
      );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const disconnectProvider = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => providerSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("account_connections")
      .delete()
      .eq("user_id", context.userId)
      .eq("provider", data.provider);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
