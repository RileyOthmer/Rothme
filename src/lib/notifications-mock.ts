export type NotificationSeverity = "critical" | "opportunity" | "info";

export type NotificationCategory =
  | "sales"
  | "ads"
  | "campaign"
  | "seo"
  | "site"
  | "ai";

export type Notification = {
  id: string;
  title: string;
  what: string;
  why: string;
  action: string;
  impact: string;
  severity: NotificationSeverity;
  category: NotificationCategory;
  createdAt: string; // ISO
};

export const CATEGORY_LABEL: Record<NotificationCategory, string> = {
  sales: "Sales",
  ads: "Advertising",
  campaign: "Campaigns",
  seo: "SEO",
  site: "Website",
  ai: "AI recommendations",
};

// Mock feed — intentionally short. Real system would push only when a
// threshold is crossed; frequency controls the rollup cadence.
export const SEED_NOTIFICATIONS: Notification[] = [
  {
    id: "n_sales_drop",
    title: "Sales dropped 22% this week",
    what: "You made $4,120 this week, down from $5,290 last week.",
    why: "Two of your top three products stopped converting on mobile after Tuesday. The rest of the store is steady.",
    action: "Open the product pages on your phone and check the Add to Cart button — a broken layout is the most likely cause.",
    impact: "If it stays flat another week, you'll miss about $1,100 in revenue.",
    severity: "critical",
    category: "sales",
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: "n_ads_budget",
    title: "Google Ads budget is spent",
    what: "Your daily budget for Google Ads ran out at 2:14pm.",
    why: "Clicks were 40% cheaper this morning, so the budget burned faster than usual.",
    action: "Raise the daily budget by $20 for the next 3 days to keep the momentum, or leave it and pick up tomorrow.",
    impact: "You're likely missing 15–20 sales-ready visitors between now and midnight.",
    severity: "critical",
    category: "ads",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: "n_campaign_win",
    title: "Your Spring Sale email is doing exceptionally well",
    what: "34% of people opened it and 6.1% clicked — more than double your usual.",
    why: "The subject line mentioned a specific product plus a real deadline. Your audience responds to both.",
    action: "Send a follow-up to people who opened but didn't click, later today.",
    impact: "A well-timed follow-up usually adds another $600–$900 in sales.",
    severity: "opportunity",
    category: "campaign",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
  },
  {
    id: "n_seo_up",
    title: "SEO traffic climbed 18%",
    what: "You had 1,240 visitors from Google this week vs. 1,050 last week.",
    why: "Your 'best running shoes for flat feet' guide started ranking on page one.",
    action: "Add a clear link from that guide to your bestselling shoe — most visitors won't find it on their own.",
    impact: "Even a 5% click-through would add roughly 60 shoppers a week.",
    severity: "opportunity",
    category: "seo",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
  },
  {
    id: "n_site_error",
    title: "Checkout is failing on Safari",
    what: "12 shoppers hit an error on the payment step in the last 4 hours. All on iPhone Safari.",
    why: "A recent script on the checkout page conflicts with Apple Pay.",
    action: "Ask your developer to remove or defer the newest checkout script. In the meantime, guide iPhone users to Chrome.",
    impact: "Each hour it stays broken costs about $180 in lost checkouts.",
    severity: "critical",
    category: "site",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
  },
  {
    id: "n_ai_recs",
    title: "3 new AI recommendations are ready",
    what: "Your strategist has fresh suggestions based on this week's numbers.",
    why: "Enough has changed since Monday that the earlier plan is out of date.",
    action: "Open the assistant and review the top recommendation first — it takes 5 minutes.",
    impact: "Following the top one typically moves next week's revenue by 4–8%.",
    severity: "info",
    category: "ai",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
];
