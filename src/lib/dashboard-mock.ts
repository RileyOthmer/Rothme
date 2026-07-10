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

export type DashboardData = {
  greetingName: string;
  timeOfDay: "morning" | "afternoon" | "evening";
  health: {
    status: HealthStatus;
    score: number;
    what: string;
    why: string;
    todo: string;
  };
  aiSummary: {
    greeting: string;
    paragraph: string;
    recommendations: { id: string; text: string; cta: string }[];
  };
  priorities: PriorityItem[];
  growth: {
    what: string;
    why: string[];
    delta: number;
  };
  performance: PerformanceRow[];
  tasks: { id: string; title: string }[];
  upcoming: UpcomingItem[];
};

function timeOfDay(): "morning" | "afternoon" | "evening" {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "evening";
}

export function getDashboardData(name = "there"): DashboardData {
  const tod = timeOfDay();
  const greet =
    tod === "morning"
      ? "Good morning"
      : tod === "afternoon"
        ? "Good afternoon"
        : "Good evening";

  const newCustomers = 12;
  const lastWeekCustomers = 9;

  return {
    greetingName: name,
    timeOfDay: tod,
    health: {
      status: "healthy",
      score: 82,
      what: "Your marketing is healthy.",
      why: "More people bought this week than last week, and your ads are steady.",
      todo: "Keep going — you have one small task today.",
    },
    aiSummary: {
      greeting: `${greet}, ${name}.`,
      paragraph:
        "Your marketing is performing well. This week your advertising brought in more customers than last week, and people are opening your emails more often. Nothing urgent — a few small moves will keep things trending up.",
      recommendations: [
        {
          id: "rec-1",
          text: "Publish one short video today. Short videos are getting the most attention from your audience this week.",
          cta: "Draft it for me",
        },
        {
          id: "rec-2",
          text: "Reply to 4 customer comments waiting since yesterday. Quick replies keep people coming back.",
          cta: "Open replies",
        },
        {
          id: "rec-3",
          text: "Increase your daily ad spend by $15. Your best ad still has room to reach more people.",
          cta: "Boost it for me",
        },
      ],
    },
    priorities: [
      {
        id: "p1",
        title: "Reply to 4 customer comments",
        why: "They've been waiting since yesterday. Quick replies keep people happy.",
        action: "Open replies",
      },
      {
        id: "p2",
        title: "Publish one short video",
        why: "Short videos are getting the most attention this week.",
        action: "Draft it for me",
      },
      {
        id: "p3",
        title: "Boost your best ad by $15/day",
        why: "It's already working — a small boost reaches more people.",
        action: "Boost it for me",
      },
    ],
    growth: {
      what: comparePlain("new customers", newCustomers, lastWeekCustomers),
      why: [
        "Your Tuesday ad reached more people than usual.",
        "Two of your new customers came from a repeat visitor who finally bought.",
      ],
      delta: newCustomers - lastWeekCustomers,
    },
    performance: [
      {
        area: "Ads",
        sentence: "Your ads are bringing in more customers than last week.",
        verdict: "working",
        advanced: [
          { label: "CTR", plain: "how often people clicked", value: "3.2%" },
          { label: "Spend", plain: "what you paid", value: "$412" },
          { label: "CPA", plain: "cost per new customer", value: "$34" },
        ],
      },
      {
        area: "Posts",
        sentence:
          "Your posts are steady — about the same number of people saw them as last week.",
        verdict: "steady",
        advanced: [
          {
            label: "Impressions",
            plain: "people who saw it",
            value: "8,200",
          },
          { label: "Likes", plain: "reactions", value: "146" },
        ],
      },
      {
        area: "Emails",
        sentence:
          "Fewer people opened your emails this week than last week.",
        verdict: "slipping",
        advanced: [
          {
            label: "Open rate",
            plain: "people who opened it",
            value: "22%",
          },
          {
            label: "Click rate",
            plain: "people who clicked a link",
            value: "3%",
          },
        ],
      },
    ],
    tasks: [
      { id: "t1", title: "Write next week's newsletter" },
      { id: "t2", title: "Pick 3 customer photos to reshare" },
      { id: "t3", title: "Update your business hours for the holiday" },
    ],
    upcoming: [
      {
        id: "u1",
        day: "Fri",
        date: "in 2 days",
        action: "Post a short customer story.",
        cta: "Draft it for me",
      },
      {
        id: "u2",
        day: "Sat",
        date: "in 3 days",
        action: "Send a weekend promotion email.",
        cta: "Draft it for me",
      },
      {
        id: "u3",
        day: "Mon",
        date: "in 5 days",
        action: "Review last week's ad results together.",
        cta: "Show me",
      },
      {
        id: "u4",
        day: "Tue",
        date: "in 6 days",
        action: "Try one new headline on your best ad.",
        cta: "Try it for me",
      },
    ],
  };
}
