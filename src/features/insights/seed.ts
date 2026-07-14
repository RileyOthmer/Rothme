import type { Insight } from "./types";

// Sample insights — labeled as demo content until the Unified Data Engine
// + provider adapters are wired. Each one reads a real metric, explains
// WHY it moved, and offers concrete next actions.

const now = new Date().toISOString();

export const SEED_INSIGHTS: Insight[] = [
  {
    id: "ins_engagement_drop",
    category: "engagement",
    headline: "Engagement dropped 12% this week because posting frequency decreased.",
    direction: "down",
    changePct: -12,
    reason:
      "You published 3 posts this week vs 6 last week. Your audience follows a weekly rhythm, so fewer posts means fewer chances to be seen. Nothing is wrong with the content itself — reach per post is actually up 4%.",
    evidence: [
      { label: "Engagement", value: "1,842", change: "−12% vs last week", source: "All platforms" },
      { label: "Posts published", value: "3", change: "−50% vs last week", source: "Publishing" },
      { label: "Reach per post", value: "6,120", change: "+4%", source: "All platforms" },
    ],
    actions: [
      { id: "a1", label: "Schedule 3 posts for the rest of this week", estimatedMinutes: 8, expectedLift: "Restores engagement to last week's baseline", cta: { label: "Open Composer", to: "/publishing/compose" } },
      { id: "a2", label: "Turn on the Wed / Fri / Sun cadence template", estimatedMinutes: 2, cta: { label: "Publishing settings", to: "/publishing/queue" } },
    ],
    confidencePct: 88,
    dataFreshnessHours: 3,
    createdAt: now,
  },
  {
    id: "ins_reels_vs_tiktok",
    category: "platform",
    headline: "Instagram Reels are outperforming TikTok videos by 2.3× on engagement.",
    direction: "up",
    changePct: 130,
    reason:
      "The same 6 videos posted to both platforms this month got 4.1% engagement on Reels vs 1.8% on TikTok. Your audience skews 25–44 and that demographic is more active on Instagram in your region.",
    evidence: [
      { label: "Reels engagement rate", value: "4.1%", source: "Instagram" },
      { label: "TikTok engagement rate", value: "1.8%", source: "TikTok" },
      { label: "Videos cross-posted", value: "6", source: "Publishing" },
    ],
    actions: [
      { id: "a1", label: "Create 3 more Reels this week", estimatedMinutes: 45, expectedLift: "+15–20% weekly engagement, typical", cta: { label: "Open Composer", to: "/publishing/compose" } },
      { id: "a2", label: "Keep TikTok on auto-crosspost — don't invest extra time there yet" },
    ],
    confidencePct: 82,
    dataFreshnessHours: 5,
    createdAt: now,
  },
  {
    id: "ins_linkedin_ctr",
    category: "content",
    headline: "LinkedIn posts receive the highest click-through rate at 3.4%.",
    direction: "up",
    reason:
      "LinkedIn CTR is 3.4% vs 1.1% on Facebook and 0.9% on X. Your audience there is decision-makers researching solutions — they're primed to click. Posts with a single link and no image performed best.",
    evidence: [
      { label: "LinkedIn CTR", value: "3.4%", change: "+0.6pp vs 30-day avg", source: "LinkedIn" },
      { label: "Facebook CTR", value: "1.1%", source: "Facebook" },
      { label: "X CTR", value: "0.9%", source: "X" },
    ],
    actions: [
      { id: "a1", label: "Publish your next 2 blog posts to LinkedIn first", estimatedMinutes: 10, cta: { label: "Open Composer", to: "/publishing/compose" } },
      { id: "a2", label: "Try one text-only post per week on LinkedIn", estimatedMinutes: 5 },
    ],
    confidencePct: 91,
    dataFreshnessHours: 2,
    createdAt: now,
  },
  {
    id: "ins_best_time",
    category: "audience",
    headline: "Your audience is most active on Wednesdays at 6 PM.",
    direction: "flat",
    reason:
      "Across the last 60 days, posts published Wednesday 5–7 PM local got 41% more reach than your average. It matches when your audience commutes home — Instagram Story views spike 3× in that window.",
    evidence: [
      { label: "Wed 6 PM reach lift", value: "+41%", source: "Instagram + Facebook" },
      { label: "Story views at 6 PM", value: "3× daily avg", source: "Instagram" },
      { label: "Sample size", value: "24 posts", source: "Publishing" },
    ],
    actions: [
      { id: "a1", label: "Post tomorrow at 7 PM instead of the morning", estimatedMinutes: 3, expectedLift: "+25–40% reach on that post", cta: { label: "Schedule now", to: "/publishing/compose" } },
      { id: "a2", label: "Move your recurring Monday post to Wednesday", estimatedMinutes: 2, cta: { label: "Open Calendar", to: "/publishing/calendar" } },
    ],
    confidencePct: 86,
    dataFreshnessHours: 12,
    createdAt: now,
  },
  {
    id: "ins_video_vs_image",
    category: "content",
    headline: "Video posts are outperforming images by 43% on reach.",
    direction: "up",
    changePct: 43,
    reason:
      "Videos averaged 8,940 reach vs 6,250 for images over the last 30 days. Platform algorithms are actively favoring short-form video right now — every video you post gets pushed to non-followers, images don't.",
    evidence: [
      { label: "Video reach avg", value: "8,940", source: "All platforms" },
      { label: "Image reach avg", value: "6,250", source: "All platforms" },
      { label: "Videos posted", value: "9", source: "Publishing" },
    ],
    actions: [
      { id: "a1", label: "Convert your 3 best-performing image posts into 15s videos", estimatedMinutes: 60, expectedLift: "+30–50% reach per repost, typical" },
      { id: "a2", label: "Shift next week's mix to 60% video, 40% image", estimatedMinutes: 5, cta: { label: "Plan the week", to: "/publishing/calendar" } },
    ],
    confidencePct: 84,
    dataFreshnessHours: 4,
    createdAt: now,
  },
  {
    id: "ins_campaign_4",
    category: "advertising",
    headline: "Campaign #4 is your cheapest cost per result — and it's under-budgeted.",
    direction: "up",
    reason:
      "Campaign #4 delivers results at $6.20 each vs $18.40 across the rest of your ads. It has spent 92% of its daily budget every day for 6 days — Meta is capping delivery because you're not funding it.",
    evidence: [
      { label: "Cost per result", value: "$6.20", change: "−66% vs account avg", source: "Meta Ads" },
      { label: "Daily budget spent", value: "92% avg", source: "Meta Ads" },
      { label: "Days budget-capped", value: "6 of 6", source: "Meta Ads" },
    ],
    actions: [
      { id: "a1", label: "Boost Campaign #4 budget by 50%", estimatedMinutes: 2, expectedLift: "+30–45% results at similar cost, typical" },
      { id: "a2", label: "Pull that budget from Campaign #1 (cost per result: $22)", estimatedMinutes: 3 },
    ],
    confidencePct: 89,
    dataFreshnessHours: 1,
    createdAt: now,
  },
];
