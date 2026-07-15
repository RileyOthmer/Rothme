import { loadStripe, type Stripe } from "@stripe/stripe-js";

type StripeEnv = "sandbox" | "live";

// BYOK Stripe publishable key. Safe to commit — publishable keys are public
// by design and only usable client-side to tokenize card details.
const publishableKey: string | undefined = "pk_test_51TszN09RrcGTTZDqy5u4VuKWZ6PtlvY8sy3nT01x9oVwCDuKuxl9g2kEQ9t72KEvthwCSwrybxvISQUy377FwKoL007DhnuJpr";

function paymentsEnvironment(): StripeEnv {
  if (publishableKey?.startsWith("pk_test_")) return "sandbox";
  if (publishableKey?.startsWith("pk_live_")) return "live";
  throw new Error(
    "Stripe is not configured for this build. Add your VITE_STRIPE_PUBLISHABLE_KEY to enable checkout.",
  );
}

let stripePromise: Promise<Stripe | null> | null = null;

export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    paymentsEnvironment();
    stripePromise = loadStripe(publishableKey as string);
  }
  return stripePromise;
}

export function getStripeEnvironment(): StripeEnv {
  return paymentsEnvironment();
}

export function isPaymentsConfigured(): boolean {
  return !!publishableKey && (publishableKey.startsWith("pk_test_") || publishableKey.startsWith("pk_live_"));
}
