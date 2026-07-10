// Plain-English weekly report generator. Deterministic per week so revisiting
// the same week shows the same numbers.

export type WeeklyReportPayload = {
  headline: string;
  score: number;
  status: "healthy" | "attention" | "risk";
  summary: string;
  highlights: { title: string; detail: string }[];
  recommendations: { title: string; why: string; action: string }[];
  impact: string;
};

export function weekStartFor(offset: number): string {
  // Monday of the week `offset` weeks ago, YYYY-MM-DD.
  const now = new Date();
  const day = now.getUTCDay(); // 0..6, Sun..Sat
  const daysSinceMonday = (day + 6) % 7;
  const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - daysSinceMonday));
  monday.setUTCDate(monday.getUTCDate() - offset * 7);
  return monday.toISOString().slice(0, 10);
}

// Small seedable RNG so reports look varied but stay stable.
function seed(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6D2B79F5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateWeeklyReport(weekStart: string): WeeklyReportPayload {
  const rand = seed(weekStart);
  const score = 62 + Math.floor(rand() * 34); // 62..95
  const status: WeeklyReportPayload["status"] = score >= 80 ? "healthy" : score >= 68 ? "attention" : "risk";
  const salesDelta = Math.floor(rand() * 26) - 8; // -8..+17
  const trafficDelta = Math.floor(rand() * 30) - 6;
  const emailOpen = 22 + Math.floor(rand() * 18);

  return {
    headline:
      status === "healthy"
        ? "A good week overall."
        : status === "attention"
          ? "Steady, with a couple of things to watch."
          : "A few things need your attention.",
    score,
    status,
    summary: `Sales ${salesDelta >= 0 ? "grew" : "dipped"} by ${Math.abs(salesDelta)}% compared to the week before. Website visits ${trafficDelta >= 0 ? "were up" : "were down"} ${Math.abs(trafficDelta)}%, and ${emailOpen}% of your email subscribers opened at least one message.`,
    highlights: [
      {
        title: salesDelta >= 0 ? "More customers bought" : "Fewer customers bought",
        detail: `You had ${8 + Math.floor(rand() * 20)} orders this week, ${salesDelta >= 0 ? "up" : "down"} ${Math.abs(salesDelta)}% from last week.`,
      },
      {
        title: "Advertising",
        detail: `Your ads brought in ${5 + Math.floor(rand() * 15)} new visitors per day on average.`,
      },
      {
        title: "Email",
        detail: `Your best-performing email had a ${emailOpen + 6}% open rate.`,
      },
    ],
    recommendations: [
      {
        title: "Publish one short video this week",
        why: "Short videos are the format your audience is engaging with most right now.",
        action: "Draft a 30-second video and post it midweek.",
      },
      {
        title: "Reply to waiting comments",
        why: "Quick replies build trust and often lead to repeat purchases.",
        action: "Spend 10 minutes on comments today.",
      },
    ],
    impact:
      status === "healthy"
        ? "Keep doing what's working — small consistent moves will compound."
        : "Fixing these this week should get you back on track without much effort.",
  };
}
