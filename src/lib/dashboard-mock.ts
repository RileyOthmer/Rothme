import { comparePlain } from "./plain-english";

export type HealthStatus = "healthy" | "attention" | "risk";
export type Verdict = "working" | "steady" | "slipping";

export type PriorityItem = {
  id: string;
  title: string;
  why: string;
  action: string;
};

export type PerformanceRow = {
  area: "Ads" | "Posts" | "Emails";
  sentence: string;
  verdict: Verdict;
  advanced: { label: string; plain: string; value: string }[];
};

export type UpcomingItem = {
  id: string;
  day: string; // "Fri"
  date: string; // "Jul 12"
  action: string;
  cta: string;
};

export type GrowthMetric = {
  id: "revenue" | "leads" | "traffic";
  label: string;
  value: string;
  deltaLabel: string;
  direction: "up" | "down" | "flat";
  plain: string;
};

export type DashboardData = {
  greetingName: string;
  health: {
    status: HealthStatus;
    score: number;
    what: string;
    why: string;
    todo: string;
  };
  businessSummary: string;
  aiSummary: {
    // Greeting is derived from time-of-day on the client (AISummary component)
    // to avoid SSR/locale hydration mismatches.
    headline: string;
    body: string;
    recommendations: { id: string; text: string; cta: string }[];
  };
  priorities: PriorityItem[];
  growth: {
    what: string;
    why: string[];
    delta: number;
  };
  growthMetrics: GrowthMetric[];
  performance: PerformanceRow[];
  tasks: { id: string; title: string }[];
  upcoming: UpcomingItem[];
};

export function getDashboardData(name = "there"): DashboardData {
  const newCustomers = 12;
  const lastWeekCustomers = 9;

  return {
    greetingName: name,
    health: {
      status: "healthy",
      score: 96,
      what: "All connected platforms are reporting normally.",
      why: "6 of 6 platforms synced in the last 4 hours. No adapter errors.",
      todo: "No action required from Rothme — this score reflects data health, not marketing quality.",
    },
    businessSummary:
      "Here's what the connected platforms reported this week. Rothme surfaces the numbers and defines the terms — it does not judge whether the results are good.",
    aiSummary: {
      headline: "Here's what changed this week across your connected platforms.",
      body:
        "New customers attributed to Meta Ads moved from 9 last week to 12 this week (+33%). Shopify revenue moved from $9,100 to $8,420 (-7%). All other platforms were within their normal 4-week range.",
      recommendations: [
        {
          id: "obs-1",
          text: "Meta Ads: new customers 12 this week vs. 9 last week (+3). Cost per new customer moved from $28 to $34.",
          cta: "",
        },
        {
          id: "obs-2",
          text: "Shopify: 74 orders vs. 82 last week (-8). Average order value was steady at $113.",
          cta: "",
        },
        {
          id: "obs-3",
          text: "Mailchimp: open rate on last send was 22%, compared to 27% on the previous send.",
          cta: "",
        },
      ],
    },
    priorities: [
      {
        id: "p1",
        title: "Meta Ads cost per new customer moved from $28 to $34.",
        why: "Reported by Meta Ads, synced 2 hours ago. Rothme does not interpret whether this change is good or bad.",
        action: "Explain how this is calculated",
      },
      {
        id: "p2",
        title: "Shopify revenue moved from $9,100 to $8,420 this week.",
        why: "Reported by Shopify, synced 1 hour ago. 74 orders vs. 82 the previous week.",
        action: "Show source data",
      },
      {
        id: "p3",
        title: "Instagram reach was 8,200 — within the normal 4-week range.",
        why: "Reported by Instagram, synced 30 minutes ago. No unusual change detected.",
        action: "Explain reach",
      },
    ],
    growth: {
      what: comparePlain("new customers", newCustomers, lastWeekCustomers),
      why: [
        "Meta Ads reported 3 more new customers than the previous 7 days.",
        "Google Ads reported 1 fewer new customer than the previous 7 days.",
      ],
      delta: newCustomers - lastWeekCustomers,
    },
    growthMetrics: [
      {
        id: "revenue",
        label: "Revenue",
        value: "$8,420",
        deltaLabel: "-7% vs last week",
        direction: "down",
        plain: "total sales reported by Shopify this week",
      },
      {
        id: "leads",
        label: "Leads",
        value: "34",
        deltaLabel: "+8 vs last week",
        direction: "up",
        plain: "form submissions reported by Google Analytics this week",
      },
      {
        id: "traffic",
        label: "Traffic",
        value: "2,180",
        deltaLabel: "+6% vs last week",
        direction: "up",
        plain: "sessions reported by Google Analytics this week",
      },
    ],
    performance: [
      {
        area: "Ads",
        sentence: "Meta Ads reported 12 new customers this week and $412 spent.",
        verdict: "working",
        advanced: [
          { label: "CTR", plain: "click-through rate", value: "3.2%" },
          { label: "Spend", plain: "amount reported to Meta", value: "$412" },
          { label: "CPA", plain: "cost per new customer", value: "$34" },
        ],
      },
      {
        area: "Posts",
        sentence:
          "Instagram reported 8,200 people reached and 146 reactions this week.",
        verdict: "steady",
        advanced: [
          { label: "Reach", plain: "unique people who saw a post", value: "8,200" },
          { label: "Reactions", plain: "likes and reactions", value: "146" },
        ],
      },
      {
        area: "Emails",
        sentence:
          "Mailchimp reported a 22% open rate on the last send (27% on the previous send).",
        verdict: "slipping",
        advanced: [
          { label: "Open rate", plain: "recipients who opened", value: "22%" },
          { label: "Click rate", plain: "recipients who clicked a link", value: "3%" },
        ],
      },
    ],
    tasks: [
      { id: "t1", title: "Connect a new platform" },
      { id: "t2", title: "Review sync status in Settings → Platforms" },
      { id: "t3", title: "Export this week's report" },
    ],
    upcoming: [
      {
        id: "u1",
        day: "Wed",
        date: "2h ago",
        action: "Meta Ads synced — cost per new customer moved from $28 to $34.",
        cta: "",
      },
      {
        id: "u2",
        day: "Wed",
        date: "1h ago",
        action: "Shopify synced — 74 orders this week vs. 82 last week.",
        cta: "",
      },
      {
        id: "u3",
        day: "Wed",
        date: "1h ago",
        action: "Google Analytics synced — sessions +5% vs. previous 7 days.",
        cta: "",
      },
      {
        id: "u4",
        day: "Wed",
        date: "6h ago",
        action: "Mailchimp synced — open rate on last send was 22%.",
        cta: "",
      },
    ],
  };
}
