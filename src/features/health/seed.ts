import type { HealthScore, PillarScore } from "./types";
import { bandFor } from "./types";

// Seed pillars — clearly labeled as sample data until the Unified Data Engine
// is fully wired. Once real MetricSnapshots exist, computeHealthScore() will
// replace this seed. UI shape stays identical.

const PILLARS: PillarScore[] = [
  {
    id: "advertising",
    label: "Advertising",
    score: 74,
    band: "steady",
    trend: "down",
    trendText: "Down 6 points this week",
    status: "Your ads are working, but they're getting more expensive.",
    explanation:
      "You're still bringing in customers from paid ads, but it's costing more to reach each one. Two of your Meta audiences overlap, so you're bidding against yourself.",
    opportunity:
      "Pause the audience overlap before you add any more budget.",
    actionPlan:
      "Turn off the 'Lookalike 3%' audience for 48 hours and check back. If costs drop, keep it off.",
    dataFreshnessHours: 2,
  },
  {
    id: "seo",
    label: "Search visibility",
    score: 82,
    band: "steady",
    trend: "up",
    trendText: "Up 3 points this month",
    status: "You're steadily showing up when people search for you.",
    explanation:
      "Your top ten pages are gaining positions on Google. Nothing dramatic, but it's the good kind of quiet growth.",
    opportunity:
      "Two product pages get lots of clicks but no sales — worth a look.",
    actionPlan:
      "Open those two pages on your phone and see what a first-time visitor would trust or hesitate about.",
    dataFreshnessHours: 12,
  },
  {
    id: "email",
    label: "Email",
    score: 61,
    band: "shaky",
    trend: "down",
    trendText: "Down 5 points this month",
    status: "Fewer people are opening your emails than usual.",
    explanation:
      "Your last three sends went to your whole list, including 412 people who haven't opened anything in 60 days. Inactive contacts drag down deliverability, which then hurts the people who do want to hear from you.",
    opportunity:
      "Clean the list of long-inactive contacts.",
    actionPlan:
      "Send a short 'we miss you' email to only the inactive segment. Remove anyone who doesn't open within 14 days.",
    dataFreshnessHours: 6,
  },
  {
    id: "social",
    label: "Social media",
    score: 88,
    band: "strong",
    trend: "up",
    trendText: "Up 4 points this week",
    status: "Your posts are landing well.",
    explanation:
      "Engagement is above your normal range on both Instagram and TikTok. Your Tuesday and Friday posts are doing most of the work.",
    opportunity:
      "Do more of what's working — you already know the format.",
    actionPlan:
      "Repeat the format of your top Tuesday post once more this week.",
    dataFreshnessHours: 4,
  },
  {
    id: "website",
    label: "Website",
    score: 76,
    band: "steady",
    trend: "flat",
    trendText: "Roughly the same as last month",
    status: "Your website is doing its job — nothing urgent.",
    explanation:
      "Speed and mobile experience are fine. Checkout on mobile is slightly below your normal range, but only 4 days of data — could just be noise.",
    opportunity:
      "Wait a few days before changing anything on mobile checkout.",
    actionPlan:
      "Re-check on Monday. If the drop holds, test checkout on your own phone.",
    dataFreshnessHours: 3,
  },
  {
    id: "retention",
    label: "Customer retention",
    score: 69,
    band: "shaky",
    trend: "flat",
    trendText: "Roughly the same as last month",
    status: "Most customers buy once and don't come back.",
    explanation:
      "Only 18% of customers make a second purchase within 90 days. Bringing in new customers is expensive — keeping existing ones is where the real money is.",
    opportunity:
      "One well-timed follow-up email after purchase can move this number a lot.",
    actionPlan:
      "Set up a single thank-you email 7 days after a customer's first order, with one gentle product suggestion.",
    dataFreshnessHours: 24,
  },
  {
    id: "revenue",
    label: "Revenue",
    score: 84,
    band: "steady",
    trend: "up",
    trendText: "Up 8% vs last month",
    status: "Revenue is growing at a healthy pace.",
    explanation:
      "You're bringing in more than last month and your average order value is holding. The growth is spread across channels, which is a good sign — you're not dependent on one source.",
    opportunity:
      "Protect what's working before chasing new channels.",
    actionPlan:
      "Don't change anything on your top-selling product page this week. Let the momentum run.",
    dataFreshnessHours: 6,
  },
];

export function getSeedHealthScore(): HealthScore {
  const scored = PILLARS.filter((p) => p.score !== null) as (PillarScore & {
    score: number;
  })[];
  const overall = scored.length
    ? Math.round(scored.reduce((s, p) => s + p.score, 0) / scored.length)
    : null;

  return {
    overall,
    overallBand: bandFor(overall),
    overallTrend: "up",
    overallTrendText: "Up 2 points this week",
    summary:
      "Your marketing is in steady shape overall. Two areas — email and customer retention — are where a small fix would move the number most.",
    pillars: PILLARS,
    computedAt: new Date().toISOString(),
  };
}
