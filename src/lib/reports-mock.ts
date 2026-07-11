// Consultant-style weekly report — 13 sections, plain English, deterministic
// per week so the same week always shows the same numbers. When real Data
// Engine adapters land, swap `generateWeeklyReport()` for an AI generator
// that reads from `getMetrics()` and returns the same shape.

export type ReportStatus = "healthy" | "attention" | "risk";

export type WeeklyReportPayload = {
  // Header
  headline: string;
  status: ReportStatus;
  score: number; // Marketing Health Score 0–100

  // Consultant sections
  businessSummary: string; // 2–3 sentences, opening the report
  wins: string[]; // things that worked
  problems: string[]; // things to watch
  recommendations: {
    title: string;
    why: string;
    action: string;
  }[];
  goals: string[]; // 2–3 goals for the coming week
  opportunities: string[]; // ideas worth exploring
  channelSummaries: {
    revenue: string;
    advertising: string;
    seo: string;
    email: string;
    social: string;
  };
  nextWeekPriorities: {
    priority: string;
    reason: string;
    estimatedResult: string;
  }[];

  // Kept for backward compatibility with older rows / list page
  summary?: string;
  highlights?: { title: string; detail: string }[];
  impact?: string;
};

export function weekStartFor(offset: number): string {
  const now = new Date();
  const day = now.getUTCDay();
  const daysSinceMonday = (day + 6) % 7;
  const monday = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() - daysSinceMonday,
    ),
  );
  monday.setUTCDate(monday.getUTCDate() - offset * 7);
  return monday.toISOString().slice(0, 10);
}

function seed(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateWeeklyReport(weekStart: string): WeeklyReportPayload {
  const rand = seed(weekStart);
  const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)];

  const score = 62 + Math.floor(rand() * 34); // 62..95
  const status: ReportStatus =
    score >= 80 ? "healthy" : score >= 68 ? "attention" : "risk";
  const revenueDelta = Math.floor(rand() * 26) - 8; // -8..+17
  const orders = 60 + Math.floor(rand() * 40);
  const revenue = 7_800 + Math.floor(rand() * 4_000);
  const adSpend = 300 + Math.floor(rand() * 250);
  const newCustomers = 8 + Math.floor(rand() * 14);
  const costPerCustomer = Math.max(12, Math.round(adSpend / newCustomers));
  const emailOpen = 20 + Math.floor(rand() * 14);
  const emailClick = 2 + Math.floor(rand() * 4);
  const sessions = 9_000 + Math.floor(rand() * 4_500);
  const sessionsDelta = Math.floor(rand() * 26) - 8;
  const followers = 40 + Math.floor(rand() * 60);

  const dir = (n: number) => (n >= 0 ? "up" : "down");
  const abs = (n: number) => Math.abs(n);

  return {
    headline:
      status === "healthy"
        ? "A strong week — the business is moving in the right direction."
        : status === "attention"
          ? "Steady week overall, with a couple of things worth a closer look."
          : "A tougher week — a few things need your attention before they compound.",
    status,
    score,

    businessSummary:
      status === "healthy"
        ? `Revenue was $${revenue.toLocaleString()} across ${orders} orders — ${dir(revenueDelta)} ${abs(revenueDelta)}% compared with last week. Advertising is bringing in customers at a reasonable cost, and your email list is engaging with what you're sending. The overall picture is healthy.`
        : status === "attention"
          ? `Revenue landed at $${revenue.toLocaleString()} on ${orders} orders, ${dir(revenueDelta)} ${abs(revenueDelta)}% versus last week. Most of the fundamentals are steady, but a few areas — mostly cost per customer and email opens — deserve a small adjustment this week.`
          : `Revenue was $${revenue.toLocaleString()} on ${orders} orders, ${dir(revenueDelta)} ${abs(revenueDelta)}% versus last week. Two or three things are pulling the numbers in the wrong direction. None are dramatic, but leaving them alone would let the trend continue.`,

    wins: [
      revenueDelta >= 0
        ? `Sales grew ${abs(revenueDelta)}% week over week — ${orders} orders totaling $${revenue.toLocaleString()}.`
        : `Average order size held steady at about $${Math.round(revenue / Math.max(orders, 1))} — customers who buy are still buying at full basket size.`,
      `Your best-performing email had a ${emailOpen + 6}% open rate — well above the ${emailOpen}% average.`,
      `You picked up ${followers} new followers this week without any paid boost.`,
    ],

    problems: [
      costPerCustomer > 30
        ? `Cost per new customer from advertising is $${costPerCustomer}. Anything above $30 is worth a closer look.`
        : `Traffic ${dir(sessionsDelta)} ${abs(sessionsDelta)}% — more people visited, but ${100 - Math.floor(rand() * 4) - 3}% of them left without buying.`,
      emailOpen < 25
        ? `Email opens dipped to ${emailOpen}%. Usually this means subject lines are getting stale or you sent at the wrong time of day.`
        : `A handful of comments from earlier in the week are still unanswered — that's a small trust hit.`,
    ],

    recommendations: [
      {
        title: "Turn off the two worst ads",
        why: `Two ads are spending money without bringing customers. Cutting them frees up about $${Math.round(adSpend * 0.2)} to send to the two ads that ARE working.`,
        action: "Open Meta Ads, sort by cost per new customer, pause the top two.",
      },
      {
        title: "Send a short winback email",
        why: "You have customers who bought once and haven't been back. A friendly nudge with a small perk usually brings 3–5% of them back.",
        action: "Write one 3-line email to buyers who last purchased 45+ days ago.",
      },
      {
        title: "Answer this week's unanswered comments",
        why: "Quick replies show you're paying attention and often lead to a follow-up sale.",
        action: "Spend 10 minutes today on Instagram and Facebook DMs and comments.",
      },
    ],

    goals: [
      revenueDelta >= 0
        ? `Grow revenue another ${3 + Math.floor(rand() * 4)}% next week.`
        : `Get revenue back to break-even with last week.`,
      `Bring cost per new customer under $${Math.max(20, costPerCustomer - 5)}.`,
      `Raise email opens to ${Math.min(35, emailOpen + 4)}%.`,
    ],

    opportunities: [
      "Short-form video is where your audience is spending time — one 30-second clip midweek is worth testing.",
      "Your top product page has strong traffic but a low buy rate. A clearer headline and one customer photo would likely help.",
      pick([
        "Bundling your two best-selling items at a modest discount usually lifts average order size 8–12%.",
        "A single Google Search Ad on your brand name is cheap insurance against competitors bidding on you.",
        "A three-message welcome email series often converts twice as well as a single welcome email.",
      ]),
    ],

    channelSummaries: {
      revenue: `${orders} orders, $${revenue.toLocaleString()} in sales, ${dir(revenueDelta)} ${abs(revenueDelta)}% from last week. Average order was about $${Math.round(revenue / Math.max(orders, 1))}.`,
      advertising: `You spent $${adSpend} on ads and got ${newCustomers} new customers — that's about $${costPerCustomer} per customer.`,
      seo: `${sessions.toLocaleString()} people found you through search this week, ${dir(sessionsDelta)} ${abs(sessionsDelta)}% from last week.`,
      email: `You sent to your list, ${emailOpen}% opened, ${emailClick}% clicked through. Opens are ${emailOpen >= 25 ? "healthy" : "on the low side of normal"}.`,
      social: `Posts reached about ${(6_000 + Math.floor(rand() * 4_000)).toLocaleString()} people. ${followers} new followers, no paid boost.`,
    },

    nextWeekPriorities: [
      {
        priority: "Pause the two worst ads and shift the budget",
        reason: "They're spending money without producing customers.",
        estimatedResult: `About $${Math.round(adSpend * 0.15)} freed up, likely ${2 + Math.floor(rand() * 3)} more customers.`,
      },
      {
        priority: "Send the winback email",
        reason: "A specific group of past customers is easiest to re-activate.",
        estimatedResult: "Usually 3–5% come back within a week.",
      },
      {
        priority: "Post one short video midweek",
        reason: "It's the format your audience is engaging with most right now.",
        estimatedResult: "Extra reach for effectively no cost — worth the 20 minutes.",
      },
    ],

    // Legacy fields (list page + old detail path still read these)
    summary:
      status === "healthy"
        ? `Sales grew ${abs(revenueDelta)}% this week. Ads and email are both performing normally.`
        : `Sales ${dir(revenueDelta)} ${abs(revenueDelta)}% this week. A couple of things need small adjustments.`,
    highlights: [
      { title: "Sales", detail: `${orders} orders, $${revenue.toLocaleString()}.` },
      { title: "Advertising", detail: `$${costPerCustomer} per new customer.` },
      { title: "Email", detail: `${emailOpen}% open rate.` },
    ],
    impact:
      status === "healthy"
        ? "Keep doing what's working — small consistent moves will compound."
        : "Fixing these this week should get you back on track without much effort.",
  };
}
