/**
 * Pre-auth discovery state — persisted to localStorage so the wizard can be
 * refreshed and the /get-started/solution + /pricing pages can read the
 * answers to personalize copy. Migrated to a server row on account creation
 * in a later phase.
 */
export type DiscoveryAnswers = {
  businessName?: string;
  industry?: string;
  businessSize?: string;
  country?: string;
  timezone?: string;
  experience?: string;
  primaryGoals?: string[];
  teamSize?: string;
  currentTools?: string[];
  budget?: string;
  painPoints?: string[];
  preferredPlatforms?: string[];
};

const KEY = "ROTHME.discovery.v1";

export function loadDiscovery(): DiscoveryAnswers {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as DiscoveryAnswers) : {};
  } catch {
    return {};
  }
}

export function saveDiscovery(a: DiscoveryAnswers): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(a));
  } catch {
    /* quota / private mode — swallow */
  }
}

export function clearDiscovery(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

export const INDUSTRIES = [
  "Retail & ecommerce",
  "Restaurant & hospitality",
  "Professional services",
  "Health & wellness",
  "Fitness & studios",
  "Beauty & personal care",
  "Home services",
  "Real estate",
  "Education & coaching",
  "SaaS & tech",
  "Nonprofit",
  "Creator / personal brand",
  "Other",
] as const;

export const BUSINESS_SIZES = [
  "Just me",
  "2–10 people",
  "11–50 people",
  "51–200 people",
  "200+ people",
] as const;

export const EXPERIENCE = [
  "Complete beginner",
  "Some experience",
  "Comfortable with the basics",
  "Advanced — I run everything myself",
] as const;

export const GOALS = [
  "Get more customers",
  "Grow social following",
  "Save time on marketing",
  "Understand what's working",
  "Post more consistently",
  "Get better ROI on ads",
  "Improve team collaboration",
  "Automate reporting",
] as const;

export const TOOLS = [
  "Meta Business Suite",
  "Google Ads",
  "Google Analytics",
  "Shopify",
  "HubSpot",
  "Mailchimp",
  "Resend",
  "Twilio",
  "Hootsuite / Buffer",
  "Notion / spreadsheets",
  "Nothing yet",
] as const;

/** External URLs for each tool shown in the "What are you using today?" step. */
export const TOOL_LINKS: Record<string, string> = {
  "Meta Business Suite": "https://business.facebook.com/",
  "Google Ads": "https://ads.google.com/",
  "Google Analytics": "https://analytics.google.com/",
  "Shopify": "https://www.shopify.com/",
  "HubSpot": "https://www.hubspot.com/",
  "Mailchimp": "https://mailchimp.com/",
  "Resend": "https://resend.com/",
  "Twilio": "https://www.twilio.com/",
  "Hootsuite / Buffer": "https://buffer.com/",
  "Notion / spreadsheets": "https://www.notion.so/",
};

export const BUDGETS = [
  "Under $500 / month",
  "$500–2,000 / month",
  "$2,000–10,000 / month",
  "$10,000+ / month",
  "Not sure yet",
] as const;

export const PAIN_POINTS = [
  "I don't know what's working",
  "I don't have time to post consistently",
  "My data lives in too many places",
  "Reporting takes forever",
  "I need help writing content",
  "My team isn't aligned",
  "I feel behind on marketing",
] as const;

export const PLATFORMS = [
  "Instagram",
  "Facebook",
  "TikTok",
  "LinkedIn",
  "YouTube",
  "X (Twitter)",
  "Pinterest",
  "Threads",
  "Google Business Profile",
] as const;
