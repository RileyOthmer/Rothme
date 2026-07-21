import type { Insight } from "./types";

// Sample observations — labeled as demo content until the Unified Data Engine
// + provider adapters are wired. Each one reports a metric and, when the data
// supports it, explains why. Rothme never recommends actions here.

const now = new Date().toISOString();

export const SEED_INSIGHTS: Insight[] = [
  {
    id: "ins_engagement_drop",
    category: "engagement",
    headline: "Total engagement was 12% lower than the previous 7 days.",
    direction: "down",
    changePct: -12,
    reason:
      "You published 3 posts this week vs. 6 the previous week. Reach per post moved +4% in the same window.",
    evidence: [
      { label: "Engagement", value: "1,842", change: "−12% vs last week", source: "All platforms" },
      { label: "Posts published", value: "3", change: "−50% vs last week", source: "Publishing" },
      { label: "Reach per post", value: "6,120", change: "+4%", source: "All platforms" },
    ],
    confidencePct: 88,
    dataFreshnessHours: 3,
    createdAt: now,
  },
  {
    id: "ins_reels_vs_tiktok",
    category: "platform",
    headline: "Instagram Reels reported 4.1% engagement rate; TikTok reported 1.8% on the same 6 videos.",
    direction: "up",
    changePct: 130,
    reason:
      "The same 6 videos were published to both platforms in the last 30 days. Rothme reports the difference; it does not interpret which platform is better for your business.",
    evidence: [
      { label: "Reels engagement rate", value: "4.1%", source: "Instagram" },
      { label: "TikTok engagement rate", value: "1.8%", source: "TikTok" },
      { label: "Videos cross-posted", value: "6", source: "Publishing" },
    ],
    confidencePct: 82,
    dataFreshnessHours: 5,
    createdAt: now,
  },
  {
    id: "ins_linkedin_ctr",
    category: "content",
    headline: "LinkedIn reported the highest click-through rate at 3.4% this period.",
    direction: "up",
    reason:
      "LinkedIn CTR was 3.4%, Facebook 1.1%, X 0.9%. Ask Rothme to define CTR if you want the formula.",
    evidence: [
      { label: "LinkedIn CTR", value: "3.4%", change: "+0.6pp vs 30-day avg", source: "LinkedIn" },
      { label: "Facebook CTR", value: "1.1%", source: "Facebook" },
      { label: "X CTR", value: "0.9%", source: "X" },
    ],
    confidencePct: 91,
    dataFreshnessHours: 2,
    createdAt: now,
  },
  {
    id: "ins_best_time",
    category: "audience",
    headline: "Posts published Wed 5–7 PM local received 41% more reach than the 60-day average.",
    direction: "flat",
    reason:
      "Sample: 24 posts over 60 days. Instagram Story views also spike ~3× the daily average in that window.",
    evidence: [
      { label: "Wed 6 PM reach lift", value: "+41%", source: "Instagram + Facebook" },
      { label: "Story views at 6 PM", value: "3× daily avg", source: "Instagram" },
      { label: "Sample size", value: "24 posts", source: "Publishing" },
    ],
    confidencePct: 86,
    dataFreshnessHours: 12,
    createdAt: now,
  },
  {
    id: "ins_video_vs_image",
    category: "content",
    headline: "Video posts averaged 8,940 reach vs. 6,250 for images over the last 30 days.",
    direction: "up",
    changePct: 43,
    reason:
      "Sample: 9 videos and 14 images across the same date range and platforms. Rothme reports the difference without interpretation.",
    evidence: [
      { label: "Video reach avg", value: "8,940", source: "All platforms" },
      { label: "Image reach avg", value: "6,250", source: "All platforms" },
      { label: "Videos posted", value: "9", source: "Publishing" },
    ],
    confidencePct: 84,
    dataFreshnessHours: 4,
    createdAt: now,
  },
  {
    id: "ins_campaign_4",
    category: "advertising",
    headline: "Meta Ads Campaign #4 reported a $6.20 cost per result vs. $18.40 across the rest of the account.",
    direction: "up",
    reason:
      "Campaign #4 spent 92% of its daily budget every day for the past 6 days. The other campaigns spent between 30% and 71%.",
    evidence: [
      { label: "Cost per result", value: "$6.20", change: "−66% vs account avg", source: "Meta Ads" },
      { label: "Daily budget spent", value: "92% avg", source: "Meta Ads" },
      { label: "Days budget-capped", value: "6 of 6", source: "Meta Ads" },
    ],
    confidencePct: 89,
    dataFreshnessHours: 1,
    createdAt: now,
  },
];
