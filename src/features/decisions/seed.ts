import type { Decision } from "./types";

// Seed decisions — clearly labeled as sample data until the Unified Data
// Engine + provider adapters are wired. Kept small on purpose: three high-signal
// decisions beats twelve noisy ones (feature quality gate).

export const SEED_DECISIONS: Decision[] = [
  {
    id: "dec_meta_cost_spike",
    priority: "high",
    headline: "Your Meta Ads cost per result is up 23% this week.",
    reason:
      "Two of your audiences overlap by 41%, so you're bidding against yourself. Competition in your category also rose after Monday.",
    recommendation:
      "Pause the 'Lookalike 3%' audience for 48 hours before you add budget. If cost per result drops, keep it paused and shift spend to 'Interest — Home Decor'.",
    confidencePct: 91,
    impact: "high",
    supportingData: [
      { label: "Cost per result", value: "$18.40", change: "+23% vs last week", source: "Meta Ads" },
      { label: "Audience overlap", value: "41%", source: "Meta Ads" },
      { label: "Impressions", value: "82,140", change: "+4%", source: "Meta Ads" },
    ],
    estimatedTimeMinutes: 5,
    estimatedResult: "Cost per result likely returns to ~$15 within 3–4 days.",
    dataFreshnessHours: 2,
    status: "open",
    createdAt: new Date().toISOString(),
  },
  {
    id: "dec_email_winback",
    priority: "medium",
    headline: "412 past customers haven't opened an email in 60 days.",
    reason:
      "Your last three campaigns went to your full list. Inactive contacts drag down deliverability and hide your best subscribers from the numbers.",
    recommendation:
      "Send a short 'we miss you' email to just this segment with one clear offer. Remove anyone who doesn't open within 14 days.",
    confidencePct: 82,
    impact: "medium",
    supportingData: [
      { label: "Inactive contacts", value: "412", source: "Mailchimp" },
      { label: "List open rate", value: "18.2%", change: "−3.1% vs 30-day avg", source: "Mailchimp" },
    ],
    estimatedTimeMinutes: 20,
    estimatedResult: "Open rate on future sends typically improves by 4–7 points after a clean-up like this.",
    dataFreshnessHours: 6,
    status: "open",
  createdAt: new Date().toISOString(),
  },
  {
    id: "dec_shopify_checkout",
    priority: "low",
    headline: "Mobile checkout completion is slightly below your normal range.",
    reason:
      "Confidence is limited — we only have 4 days of data since your theme update. It could be normal variance.",
    recommendation:
      "Wait 3 more days before changing anything. If the drop continues, test checkout on your phone and look for a new field or step.",
    confidencePct: 54,
    impact: "low",
    supportingData: [
      { label: "Mobile checkout rate", value: "62.1%", change: "−4.2% vs 30-day avg", source: "Shopify" },
      { label: "Sample size", value: "4 days", source: "Shopify" },
    ],
    estimatedTimeMinutes: 0,
    estimatedResult: "Too early to say — we'll re-evaluate once there's a full week of data.",
    dataFreshnessHours: 3,
    status: "open",
    createdAt: new Date().toISOString(),
  },
];
