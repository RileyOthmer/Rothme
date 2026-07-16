import Stripe from "stripe";

const getEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`${key} is not configured`);
  return value;
};

const optEnv = (key: string): string | undefined => process.env[key] || undefined;

/**
 * StripeEnv is kept for backwards-compatibility with UI/DB filters
 * (subscriptions.environment). With BYOK Stripe we detect it from the
 * secret key prefix — a single Stripe account is used per project.
 */
export type StripeEnv = "sandbox" | "live";

export function getStripeEnvironmentFromKey(): StripeEnv {
  const key = getEnv("STRIPE_SECRET_KEY");
  if (key.startsWith("sk_test_") || key.startsWith("rk_test_")) return "sandbox";
  return "live";
}

/**
 * BYOK Stripe client — talks directly to api.stripe.com using the
 * customer's STRIPE_SECRET_KEY. The `env` argument is accepted for
 * signature compatibility with existing callers but ignored: the
 * environment is derived from the key prefix.
 */
export function createStripeClient(_env?: StripeEnv): Stripe {
  const secret = getEnv("STRIPE_SECRET_KEY");
  return new Stripe(secret, {
    apiVersion: "2026-03-25.dahlia",
    httpClient: Stripe.createFetchHttpClient(),
  });
}

/**
 * Map the app's stable plan slugs to real Stripe price IDs from env.
 * Falls back to the raw input if it already looks like a Stripe price ID.
 */
export const PRO_MONTHLY_PRICE_ID = "price_1TtBWiRCrO28cDbmovSMFJeC";

export function resolvePriceId(slug: string): string {
  if (slug.startsWith("price_")) return slug;
  if (slug === "pro_monthly") return PRO_MONTHLY_PRICE_ID;
  if (slug === "pro_annual") return PRO_MONTHLY_PRICE_ID;
  throw new Error(`Unknown price slug: ${slug}`);
}

/**
 * Inverse of resolvePriceId — turn a Stripe price ID (as seen in webhook
 * events) back into the app's stable slug, so DB/UI keep using
 * "pro_monthly" for tier gating.
 */
export function slugFromPriceId(priceId: string | undefined | null): string | null {
  if (!priceId) return null;
  if (priceId === PRO_MONTHLY_PRICE_ID) return "pro_monthly";
  return priceId;
}

export function getStripeErrorMessage(error: unknown): string {
  if (error && typeof error === "object") {
    const e = error as {
      message?: string; type?: string; code?: string; decline_code?: string; param?: string; requestId?: string;
      raw?: { message?: string; type?: string; code?: string; decline_code?: string; param?: string; requestId?: string };
    };
    const message = e.raw?.message ?? e.message;
    if (message) {
      const details = [
        e.raw?.type ?? e.type,
        e.raw?.code ?? e.code,
        e.raw?.decline_code ?? e.decline_code,
        e.raw?.param ?? e.param,
        e.raw?.requestId ?? e.requestId,
      ].filter(Boolean);
      return details.length ? `${message} (${details.join(", ")})` : message;
    }
  }
  return "Stripe request failed";
}

export async function verifyWebhook(
  req: Request,
  _env?: StripeEnv,
): Promise<{ type: string; data: { object: any } }> {
  const signature = req.headers.get("stripe-signature");
  const body = await req.text();
  const secret = getEnv("STRIPE_WEBHOOK_SECRET");

  if (!signature || !body) throw new Error("Missing signature or body");

  let timestamp: string | undefined;
  const v1Signatures: string[] = [];
  for (const part of signature.split(",")) {
    const [key, value] = part.split("=", 2);
    if (key === "t") timestamp = value;
    if (key === "v1") v1Signatures.push(value);
  }
  if (!timestamp || v1Signatures.length === 0) throw new Error("Invalid signature format");

  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (age > 300) throw new Error("Webhook timestamp too old");

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signed = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${timestamp}.${body}`),
  );
  const expected = Buffer.from(new Uint8Array(signed)).toString("hex");
  if (!v1Signatures.includes(expected)) throw new Error("Invalid webhook signature");
  return JSON.parse(body);
}
