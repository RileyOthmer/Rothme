/**
 * Integration registry — the ONLY place platforms are declared.
 *
 * Adding a new platform:
 *   1. Add an entry below.
 *   2. Done. UI, search, categories, and status all pick it up.
 *
 * Do NOT hard-code platform logic in the UI. Do NOT branch on `id` in
 * components. If a platform needs custom behavior at connection time, add
 * it to its adapter (see docs/integrations/adding-a-connector.md), not here.
 */

import type { IntegrationDefinition } from "./types";

const READ_ADS = ["Read ad performance", "Read campaign spend"];
const READ_SOCIAL = ["Read post metrics", "Read follower counts"];
const READ_STORE = ["Read orders", "Read products", "Read customers"];
const READ_ANALYTICS = ["Read website traffic", "Read page performance"];
const READ_EMAIL = ["Read campaign results", "Read subscriber counts"];
const READ_PAY = ["Read payments", "Read refunds"];
const READ_CRM = ["Read contacts", "Read pipeline activity"];

export const INTEGRATIONS: IntegrationDefinition[] = [
  // Advertising
  { id: "google_ads", name: "Google Ads", category: "advertising", mark: "GA", brandColor: "#4285F4",
    summary: "How much you're spending on Google search ads and what comes back.",
    permissions: READ_ADS, available: true },
  { id: "meta_ads", name: "Meta Ads", category: "advertising", mark: "MA", brandColor: "#0866FF",
    summary: "Facebook and Instagram ad results in plain English.",
    permissions: READ_ADS, available: true },
  { id: "tiktok_ads", name: "TikTok Ads", category: "advertising", mark: "TT", brandColor: "#000000",
    summary: "TikTok ad spend, views, and results.",
    permissions: READ_ADS, available: false },

  // Social
  { id: "instagram", name: "Instagram", category: "social", mark: "IG", brandColor: "#E4405F",
    summary: "Post performance, follower growth, and comments to reply to.",
    permissions: READ_SOCIAL, available: false },
  { id: "facebook", name: "Facebook", category: "social", mark: "FB", brandColor: "#1877F2",
    summary: "Page posts, followers, and engagement.",
    permissions: READ_SOCIAL, available: false },
  { id: "threads", name: "Threads", category: "social", mark: "TH", brandColor: "#000000",
    summary: "Threads post reach and replies.",
    permissions: READ_SOCIAL, available: false },
  { id: "whatsapp_business", name: "WhatsApp Business", category: "social", mark: "WA", brandColor: "#25D366",
    summary: "Customer conversations and response times.",
    permissions: ["Read message stats", "Read contact counts"], available: false },
  { id: "tiktok", name: "TikTok", category: "social", mark: "TK", brandColor: "#000000",
    summary: "Video views, followers, and top-performing posts.",
    permissions: READ_SOCIAL, available: false },
  { id: "linkedin", name: "LinkedIn", category: "social", mark: "LI", brandColor: "#0A66C2",
    summary: "Company page posts and follower growth.",
    permissions: READ_SOCIAL, available: false },
  { id: "x", name: "X", category: "social", mark: "X", brandColor: "#000000",
    summary: "Post reach, replies, and follower changes.",
    permissions: READ_SOCIAL, available: false },
  { id: "pinterest", name: "Pinterest", category: "social", mark: "PN", brandColor: "#E60023",
    summary: "Pin saves, clicks, and top boards.",
    permissions: READ_SOCIAL, available: false },
  { id: "snapchat", name: "Snapchat", category: "social", mark: "SC", brandColor: "#FFFC00",
    summary: "Story views and audience growth.",
    permissions: READ_SOCIAL, available: false },
  { id: "youtube", name: "YouTube", category: "social", mark: "YT", brandColor: "#FF0000",
    summary: "Video views, watch time, and subscribers.",
    permissions: READ_SOCIAL, available: false },

  // Analytics
  { id: "ga4", name: "Google Analytics 4", category: "analytics", mark: "GA", brandColor: "#E37400",
    summary: "How many people visit your site and what they do.",
    permissions: READ_ANALYTICS, available: true },
  { id: "search_console", name: "Search Console", category: "analytics", mark: "SC", brandColor: "#4285F4",
    summary: "Which Google searches bring people to your site.",
    permissions: ["Read search performance", "Read indexed pages"], available: false },
  { id: "microsoft_clarity", name: "Microsoft Clarity", category: "analytics", mark: "MC", brandColor: "#3B2E58",
    summary: "How visitors actually use your site — clicks and scroll.",
    permissions: ["Read session insights"], available: false },

  // Ecommerce
  { id: "shopify", name: "Shopify", category: "ecommerce", mark: "SH", brandColor: "#95BF47",
    summary: "Sales, orders, and best-selling products.",
    permissions: READ_STORE, available: true },
  { id: "woocommerce", name: "WooCommerce", category: "ecommerce", mark: "WC", brandColor: "#7F54B3",
    summary: "Store orders and revenue from WordPress.",
    permissions: READ_STORE, available: false },
  { id: "bigcommerce", name: "BigCommerce", category: "ecommerce", mark: "BC", brandColor: "#121118",
    summary: "Orders, products, and revenue.",
    permissions: READ_STORE, available: false },
  { id: "squarespace", name: "Squarespace", category: "ecommerce", mark: "SQ", brandColor: "#000000",
    summary: "Store sales and visitor stats.",
    permissions: READ_STORE, available: false },
  { id: "wix", name: "Wix", category: "ecommerce", mark: "WX", brandColor: "#0C6EFC",
    summary: "Store sales and site activity.",
    permissions: READ_STORE, available: false },

  // Payments
  { id: "stripe", name: "Stripe", category: "payments", mark: "ST", brandColor: "#635BFF",
    summary: "Payments received, refunds, and revenue.",
    permissions: READ_PAY, available: false },
  { id: "square", name: "Square", category: "payments", mark: "SQ", brandColor: "#000000",
    summary: "In-person and online sales.",
    permissions: READ_PAY, available: false },
  { id: "paypal", name: "PayPal", category: "payments", mark: "PP", brandColor: "#003087",
    summary: "PayPal payments and refunds.",
    permissions: READ_PAY, available: false },

  // Email & SMS
  { id: "mailchimp", name: "Mailchimp", category: "email", mark: "MC", brandColor: "#FFE01B",
    summary: "Email campaigns — who opened, who clicked, who unsubscribed.",
    permissions: READ_EMAIL, available: true },
  { id: "klaviyo", name: "Klaviyo", category: "email", mark: "KL", brandColor: "#000000",
    summary: "Email and SMS campaign results.",
    permissions: READ_EMAIL, available: false },
  { id: "constant_contact", name: "Constant Contact", category: "email", mark: "CC", brandColor: "#1856A7",
    summary: "Email campaign performance.",
    permissions: READ_EMAIL, available: false },
  { id: "activecampaign", name: "ActiveCampaign", category: "email", mark: "AC", brandColor: "#356AE6",
    summary: "Email results and automation activity.",
    permissions: READ_EMAIL, available: false },

  // CRM
  { id: "hubspot", name: "HubSpot", category: "crm", mark: "HS", brandColor: "#FF7A59",
    summary: "New leads, deals, and pipeline progress.",
    permissions: READ_CRM, available: false },

  // Business presence
  { id: "google_business_profile", name: "Google Business Profile", category: "presence", mark: "GB", brandColor: "#4285F4",
    summary: "Reviews, calls, and directions requests from Google.",
    permissions: ["Read reviews", "Read profile insights"], available: false },
];

export const INTEGRATIONS_BY_ID = new Map(INTEGRATIONS.map((i) => [i.id, i]));

export function getIntegration(id: string) {
  return INTEGRATIONS_BY_ID.get(id);
}
