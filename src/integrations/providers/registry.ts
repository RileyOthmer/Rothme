/**
 * The registry — the ONLY place in the codebase that lists every platform.
 *
 * Adding a new platform:
 *   1. Create src/integrations/providers/<slug>/index.ts exporting an adapter.
 *   2. Add its id to ProviderId in types.ts.
 *   3. Import + register it below.
 * Nothing else in the app changes.
 *
 * v1 uses stubs so the connector catalog, UI, and AI mock can already iterate
 * the real registry shape. Real adapters swap in one folder at a time.
 */
import type { ProviderAdapter, ProviderId } from "./types";
import { defineStubAdapter } from "./stub";

export const registry: Record<ProviderId, ProviderAdapter> = {
  meta_ads: defineStubAdapter({
    id: "meta_ads",
    name: "Meta Ads",
    category: "ads",
    authKind: "connector_gateway",
    blurb: "Facebook and Instagram ad results.",
  }),
  google_ads: defineStubAdapter({
    id: "google_ads",
    name: "Google Ads",
    category: "ads",
    authKind: "connector_gateway",
    blurb: "Search and display advertising performance.",
  }),
  ga4: defineStubAdapter({
    id: "ga4",
    name: "Google Analytics",
    category: "analytics",
    authKind: "connector_gateway",
    blurb: "Website traffic, sources, and behavior.",
  }),
  shopify: defineStubAdapter({
    id: "shopify",
    name: "Shopify",
    category: "commerce",
    authKind: "connector_gateway",
    blurb: "Sales, orders, and revenue from your store.",
  }),
  stripe: defineStubAdapter({
    id: "stripe",
    name: "Stripe",
    category: "payments",
    authKind: "connector_gateway",
    blurb: "Revenue and subscriptions from payments.",
  }),
  tiktok: defineStubAdapter({
    id: "tiktok",
    name: "TikTok",
    category: "social",
    authKind: "oauth2",
    blurb: "Video posts, views, and ad performance.",
  }),
  linkedin: defineStubAdapter({
    id: "linkedin",
    name: "LinkedIn",
    category: "social",
    authKind: "connector_gateway",
    blurb: "Company posts and ad campaigns.",
  }),
  pinterest: defineStubAdapter({
    id: "pinterest",
    name: "Pinterest",
    category: "social",
    authKind: "oauth2",
    blurb: "Pin performance and audience reach.",
  }),
  snapchat: defineStubAdapter({
    id: "snapchat",
    name: "Snapchat",
    category: "ads",
    authKind: "oauth2",
    blurb: "Snap Ads campaigns and results.",
  }),
  x: defineStubAdapter({
    id: "x",
    name: "X",
    category: "social",
    authKind: "connector_gateway",
    blurb: "Post reach and engagement on X.",
  }),
  youtube: defineStubAdapter({
    id: "youtube",
    name: "YouTube",
    category: "social",
    authKind: "connector_gateway",
    blurb: "Video views, watch time, and subscribers.",
  }),
  klaviyo: defineStubAdapter({
    id: "klaviyo",
    name: "Klaviyo",
    category: "email",
    authKind: "api_key",
    blurb: "Email and SMS campaign performance.",
  }),
  mailchimp: defineStubAdapter({
    id: "mailchimp",
    name: "Mailchimp",
    category: "email",
    authKind: "connector_gateway",
    blurb: "Email campaigns and open rates.",
  }),
  hubspot: defineStubAdapter({
    id: "hubspot",
    name: "HubSpot",
    category: "crm",
    authKind: "connector_gateway",
    blurb: "Leads, contacts, and pipeline signal.",
  }),
};

export function getAdapter(id: ProviderId): ProviderAdapter {
  const adapter = registry[id];
  if (!adapter) throw new Error(`Unknown provider: ${id}`);
  return adapter;
}

export function listAdapters(): ProviderAdapter[] {
  return Object.values(registry);
}

export function listAdaptersByCategory() {
  const out: Record<string, ProviderAdapter[]> = {};
  for (const a of listAdapters()) {
    (out[a.category] ??= []).push(a);
  }
  return out;
}
