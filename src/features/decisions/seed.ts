import type { Decision } from "./types";

// Seed observations — clearly labeled as sample data until the Unified Data
// Engine + provider adapters are wired. Rothme reports facts here — it does
// not recommend actions.

export const SEED_DECISIONS: Decision[] = [
  {
    id: "obs_meta_cost_spike",
    priority: "notable",
    headline: "Meta Ads cost per result moved from $14.95 to $18.40 this week (+23%).",
    reason:
      "Two audiences overlap by 41% — the same people are eligible in both ad sets. Overall impressions also moved +4%.",
    recommendation:
      "Cost per result = amount spent ÷ results attributed by Meta. Both values come from the Meta Ads Insights API for the reporting window shown.",
    confidencePct: 91,
    impact: "high",
    supportingData: [
      { label: "Cost per result", value: "$18.40", change: "+23% vs last week", source: "Meta Ads" },
      { label: "Audience overlap", value: "41%", source: "Meta Ads" },
      { label: "Impressions", value: "82,140", change: "+4%", source: "Meta Ads" },
    ],
    estimatedTimeMinutes: 0,
    estimatedResult: "Meta Ads Insights API (synced 2 hours ago).",
    dataFreshnessHours: 2,
    status: "open",
    createdAt: new Date().toISOString(),
  },
  {
    id: "obs_email_inactive",
    priority: "watch",
    headline: "412 contacts have not opened a Mailchimp email in 60 days.",
    reason:
      "The last three campaigns went to the full list. List open rate moved from ~21.3% (30-day avg) to 18.2% on the last send.",
    recommendation:
      "Inactive contact count = contacts with 0 opens across sends in the last 60 days. List open rate = unique opens ÷ delivered.",
    confidencePct: 82,
    impact: "medium",
    supportingData: [
      { label: "Inactive contacts", value: "412", source: "Mailchimp" },
      { label: "List open rate", value: "18.2%", change: "−3.1% vs 30-day avg", source: "Mailchimp" },
    ],
    estimatedTimeMinutes: 0,
    estimatedResult: "Mailchimp Marketing API (synced 6 hours ago).",
    dataFreshnessHours: 6,
    status: "open",
    createdAt: new Date().toISOString(),
  },
  {
    id: "obs_shopify_checkout",
    priority: "watch",
    headline: "Mobile checkout completion is 62.1% — 4.2 points below the 30-day average.",
    reason:
      "Only 4 days of data since the last theme update. Sample size is small; this could be normal variance.",
    recommendation:
      "Mobile checkout rate = mobile completed checkouts ÷ mobile started checkouts, reported by Shopify Analytics.",
    confidencePct: 54,
    impact: "low",
    supportingData: [
      { label: "Mobile checkout rate", value: "62.1%", change: "−4.2% vs 30-day avg", source: "Shopify" },
      { label: "Sample size", value: "4 days", source: "Shopify" },
    ],
    estimatedTimeMinutes: 0,
    estimatedResult: "Shopify Analytics API (synced 3 hours ago).",
    dataFreshnessHours: 3,
    status: "open",
    createdAt: new Date().toISOString(),
  },
];
