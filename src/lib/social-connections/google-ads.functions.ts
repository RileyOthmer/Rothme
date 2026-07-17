/**
 * Google Ads campaign + performance queries.
 * Uses the OAuth access token stored on the user's connected `google_ads`
 * social_accounts row. Client-safe module — server-only deps loaded inside
 * handler bodies.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const GOOGLE_ADS_API_VERSION = "v18";

async function getFreshAccessToken(
  supabase: Awaited<ReturnType<typeof import("@/integrations/supabase/auth-middleware").requireSupabaseAuth> extends never ? never : any>,
  userId: string,
): Promise<{ accessToken: string; customerId: string; accountId: string }> {
  const { data: row, error } = await supabase
    .from("social_accounts")
    .select("id, platform_account_id, encrypted_access_token, encrypted_refresh_token, token_expiration")
    .eq("user_id", userId)
    .eq("platform", "google_ads")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!row) throw new Error("Google Ads is not connected");
  if (!row.encrypted_access_token) throw new Error("No access token stored");

  const { decryptJson, encryptJson } = await import("@/lib/integrations/crypto.server");
  let accessToken = decryptJson<{ accessToken?: string }>(row.encrypted_access_token).accessToken;
  if (!accessToken) throw new Error("Access token missing");

  const expiresAt = row.token_expiration ? new Date(row.token_expiration).getTime() : 0;
  const needsRefresh = expiresAt && expiresAt - Date.now() < 60_000;
  if (needsRefresh && row.encrypted_refresh_token) {
    const stored = decryptJson<{ refreshToken?: string }>(row.encrypted_refresh_token);
    if (stored.refreshToken) {
      const { getAdapter } = await import("./adapter.server");
      const bundle = await getAdapter("google_ads").refreshToken({ refreshToken: stored.refreshToken });
      accessToken = bundle.accessToken;
      const newExpires = bundle.expiresIn
        ? new Date(Date.now() + bundle.expiresIn * 1000).toISOString()
        : null;
      await supabase
        .from("social_accounts")
        .update({
          encrypted_access_token: encryptJson({ accessToken }),
          token_expiration: newExpires,
        })
        .eq("id", row.id);
    }
  }

  if (!row.platform_account_id) throw new Error("No Google Ads customer linked to this account");
  return { accessToken, customerId: row.platform_account_id, accountId: row.id };
}

async function googleAdsSearch(params: {
  accessToken: string;
  customerId: string;
  query: string;
  loginCustomerId?: string;
}): Promise<Array<Record<string, unknown>>> {
  const devToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
  if (!devToken) throw new Error("GOOGLE_ADS_DEVELOPER_TOKEN is not configured");
  const headers: Record<string, string> = {
    Authorization: `Bearer ${params.accessToken}`,
    "developer-token": devToken,
    "Content-Type": "application/json",
  };
  if (params.loginCustomerId) headers["login-customer-id"] = params.loginCustomerId;
  const res = await fetch(
    `https://googleads.googleapis.com/${GOOGLE_ADS_API_VERSION}/customers/${params.customerId}/googleAds:search`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({ query: params.query, pageSize: 500 }),
    },
  );
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Google Ads search failed (${res.status}): ${text.slice(0, 400)}`);
  }
  const json = (await res.json()) as { results?: Array<Record<string, unknown>> };
  return json.results ?? [];
}

export const listGoogleAdsAccessibleCustomers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { accessToken } = await getFreshAccessToken(context.supabase, context.userId);
    const devToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
    if (!devToken) throw new Error("GOOGLE_ADS_DEVELOPER_TOKEN is not configured");
    const res = await fetch(
      `https://googleads.googleapis.com/${GOOGLE_ADS_API_VERSION}/customers:listAccessibleCustomers`,
      { headers: { Authorization: `Bearer ${accessToken}`, "developer-token": devToken } },
    );
    if (!res.ok) throw new Error(`listAccessibleCustomers failed: ${res.status} ${await res.text().catch(() => "")}`);
    const j = (await res.json()) as { resourceNames?: string[] };
    return (j.resourceNames ?? []).map((r) => ({ resourceName: r, customerId: r.split("/")[1] ?? "" }));
  });

export const fetchGoogleAdsCampaigns = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { dateRange?: "LAST_7_DAYS" | "LAST_30_DAYS" | "LAST_90_DAYS" }) =>
    z.object({ dateRange: z.enum(["LAST_7_DAYS", "LAST_30_DAYS", "LAST_90_DAYS"]).optional() }).parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { accessToken, customerId } = await getFreshAccessToken(context.supabase, context.userId);
    const range = data.dateRange ?? "LAST_30_DAYS";
    const query = `
      SELECT
        campaign.id,
        campaign.name,
        campaign.status,
        campaign.advertising_channel_type,
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros,
        metrics.conversions,
        metrics.conversions_value,
        metrics.ctr,
        metrics.average_cpc
      FROM campaign
      WHERE segments.date DURING ${range}
      ORDER BY metrics.cost_micros DESC
    `.trim();

    const rows = await googleAdsSearch({ accessToken, customerId, query });
    const campaigns = rows.map((row) => {
      const c = (row.campaign ?? {}) as Record<string, unknown>;
      const m = (row.metrics ?? {}) as Record<string, unknown>;
      const costMicros = Number(m.costMicros ?? 0);
      return {
        id: String(c.id ?? ""),
        name: String(c.name ?? ""),
        status: String(c.status ?? ""),
        channelType: String(c.advertisingChannelType ?? ""),
        impressions: Number(m.impressions ?? 0),
        clicks: Number(m.clicks ?? 0),
        costUsd: costMicros / 1_000_000,
        conversions: Number(m.conversions ?? 0),
        conversionValueUsd: Number(m.conversionsValue ?? 0),
        ctr: Number(m.ctr ?? 0),
        averageCpcUsd: Number(m.averageCpc ?? 0) / 1_000_000,
      };
    });

    const totals = campaigns.reduce(
      (acc, c) => {
        acc.impressions += c.impressions;
        acc.clicks += c.clicks;
        acc.costUsd += c.costUsd;
        acc.conversions += c.conversions;
        acc.conversionValueUsd += c.conversionValueUsd;
        return acc;
      },
      { impressions: 0, clicks: 0, costUsd: 0, conversions: 0, conversionValueUsd: 0 },
    );

    return { customerId, dateRange: range, campaigns, totals };
  });

export const setGoogleAdsCustomer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { customerId: string }) =>
    z.object({ customerId: z.string().regex(/^\d+$/, "Customer ID must be numeric") }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("social_accounts")
      .update({
        platform_account_id: data.customerId,
        display_name: `Google Ads Customer ${data.customerId}`,
        username: `customers/${data.customerId}`,
      })
      .eq("user_id", context.userId)
      .eq("platform", "google_ads");
    if (error) throw new Error(error.message);
    return { ok: true };
  });
