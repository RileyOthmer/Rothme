/**
 * Plain-English enforcement for the dashboard.
 * Single source of truth for banned marketing jargon and its everyday
 * replacements. Dashboard copy and the AI summary generator both pull
 * from here so nothing drifts.
 */

export const banned = [
  "CTR",
  "CPC",
  "CPM",
  "CPA",
  "ROAS",
  "impressions",
  "reach",
  "engagement rate",
  "conversion rate",
  "conversions",
  "funnel",
  "SEO",
  "SERP",
  "organic traffic",
  "bounce rate",
  "sessions",
  "MAU",
  "DAU",
  "retention cohort",
  "attribution",
  "MQL",
  "SQL lead",
  "top-of-funnel",
  "bottom-of-funnel",
] as const;

export const replacements: Record<string, string> = {
  CTR: "how often people clicked",
  CPC: "cost per click",
  CPM: "cost to reach 1,000 people",
  CPA: "cost to get one customer",
  ROAS: "money earned for every $1 spent",
  impressions: "people who saw it",
  reach: "people who saw it",
  "engagement rate": "how often people react",
  "conversion rate": "how often visitors buy",
  conversions: "people who bought",
  "bounce rate": "people who left right away",
  sessions: "visits",
  budget: "daily spend",
  audience: "people you're reaching",
};

/** Format a currency delta as a short plain sentence fragment. */
export function money(amount: number): string {
  if (Math.abs(amount) < 100) return `$${Math.round(amount)}`;
  return `$${Math.round(amount).toLocaleString()}`;
}

/** Compare this-week vs last-week and return a plain sentence. */
export function comparePlain(
  noun: string,
  thisWeek: number,
  lastWeek: number,
): string {
  const diff = thisWeek - lastWeek;
  if (diff === 0) return `${thisWeek} ${noun} this week — same as last week.`;
  const dir = diff > 0 ? "more" : "fewer";
  return `${thisWeek} ${noun} this week — ${Math.abs(diff)} ${dir} than last week.`;
}
