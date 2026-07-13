// Analytics KPI registry + deterministic mock data. No live provider yet —
// values are seeded per metric + range so the dashboard is stable across
// renders while we wire real connectors.

export type MetricFormat = "number" | "percent" | "currency" | "duration" | "multiplier";

export type MetricCategory = "audience" | "engagement" | "traffic" | "video" | "revenue";

export type Metric = {
  id: string;
  label: string;
  category: MetricCategory;
  format: MetricFormat;
  // Plain-English one-liner shown in the detail view.
  description: string;
  // Base value for a 30-day window; mock scales linearly with range.
  base30d: number;
  // Whether higher is better (drives delta colouring).
  higherIsBetter: boolean;
};

export const METRICS: Metric[] = [
  { id: "followers",       label: "Total Followers",  category: "audience",   format: "number",     base30d: 48_230,   higherIsBetter: true,  description: "How many people follow your accounts across every connected network." },
  { id: "reach",           label: "Reach",            category: "audience",   format: "number",     base30d: 312_400,  higherIsBetter: true,  description: "The number of unique people who saw your content." },
  { id: "impressions",     label: "Impressions",      category: "audience",   format: "number",     base30d: 812_900,  higherIsBetter: true,  description: "The total number of times your content was shown." },
  { id: "profile_visits",  label: "Profile Visits",   category: "audience",   format: "number",     base30d: 14_820,   higherIsBetter: true,  description: "How many people opened one of your profiles." },

  { id: "engagement_rate", label: "Engagement Rate",  category: "engagement", format: "percent",    base30d: 0.048,    higherIsBetter: true,  description: "Share of people who saw your content and interacted with it." },
  { id: "likes",           label: "Likes",            category: "engagement", format: "number",     base30d: 26_540,   higherIsBetter: true,  description: "How many likes your content received." },
  { id: "comments",        label: "Comments",         category: "engagement", format: "number",     base30d: 3_120,    higherIsBetter: true,  description: "How many comments your content received." },
  { id: "shares",          label: "Shares",           category: "engagement", format: "number",     base30d: 1_845,    higherIsBetter: true,  description: "How many times your content was shared with someone else." },
  { id: "saves",           label: "Saves",            category: "engagement", format: "number",     base30d: 2_970,    higherIsBetter: true,  description: "How many people saved your content to come back to it." },

  { id: "website_clicks",  label: "Website Clicks",   category: "traffic",    format: "number",     base30d: 8_940,    higherIsBetter: true,  description: "Clicks that sent someone from social to your website." },
  { id: "link_clicks",     label: "Link Clicks",      category: "traffic",    format: "number",     base30d: 5_610,    higherIsBetter: true,  description: "Clicks on any link in your posts, bio, or ads." },
  { id: "ctr",             label: "CTR",              category: "traffic",    format: "percent",    base30d: 0.021,    higherIsBetter: true,  description: "Share of people who saw a link and clicked it." },

  { id: "video_views",     label: "Video Views",      category: "video",      format: "number",     base30d: 184_300,  higherIsBetter: true,  description: "How many times your videos were viewed." },
  { id: "watch_time",      label: "Watch Time",       category: "video",      format: "duration",   base30d: 128_400,  higherIsBetter: true,  description: "Total time people spent watching your videos, in minutes." },

  { id: "conversions",     label: "Conversions",      category: "revenue",    format: "number",     base30d: 942,      higherIsBetter: true,  description: "How many people completed a goal you're tracking." },
  { id: "revenue",         label: "Revenue",          category: "revenue",    format: "currency",   base30d: 68_450,   higherIsBetter: true,  description: "Revenue attributed to your marketing this period." },
  { id: "roas",            label: "ROAS",             category: "revenue",    format: "multiplier", base30d: 3.4,      higherIsBetter: true,  description: "Return on ad spend — every $1 in ads earns this back." },
];

export const CATEGORY_LABEL: Record<MetricCategory, string> = {
  audience: "Audience",
  engagement: "Engagement",
  traffic: "Traffic & clicks",
  video: "Video",
  revenue: "Revenue",
};

export const RANGE_OPTIONS = [7, 14, 30, 90] as const;
export type RangeDays = (typeof RANGE_OPTIONS)[number];

export function getMetric(id: string): Metric | undefined {
  return METRICS.find((m) => m.id === id);
}

// ---------- Deterministic mock ----------

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function seededRand(seed: number): () => number {
  let s = seed || 1;
  return () => {
    s = (s * 1664525 + 1013904223) % 4_294_967_296;
    return s / 4_294_967_296;
  };
}

export type SeriesPoint = { day: string; value: number };

export type MetricSeries = {
  current: SeriesPoint[];
  previous: SeriesPoint[];
  currentTotal: number;
  previousTotal: number;
  delta: number; // ratio, e.g. 0.12 = +12%
};

// Averaged metrics use mean instead of sum for totals.
const AVERAGED = new Set(["engagement_rate", "ctr", "roas", "followers"]);

export function generateSeries(metricId: string, range: RangeDays): MetricSeries {
  const metric = getMetric(metricId);
  if (!metric) {
    return { current: [], previous: [], currentTotal: 0, previousTotal: 0, delta: 0 };
  }

  const rand = seededRand(hash(`${metricId}:${range}`));
  // Volatility differs by format so percents don't look like impressions.
  const noise = metric.format === "percent" || metric.format === "multiplier" ? 0.12 : 0.28;
  // Small deterministic trend, ~[-10%, +18%] over the window.
  const trendPct = ((hash(metricId) % 28) - 10) / 100;

  const perDayBase = metric.base30d / 30;

  const build = (offset: number): SeriesPoint[] => {
    const out: SeriesPoint[] = [];
    for (let i = 0; i < range; i++) {
      const d = new Date(Date.now() - (offset + range - 1 - i) * 86_400_000);
      const drift = 1 + trendPct * (i / Math.max(range - 1, 1));
      const jitter = 1 + (rand() - 0.5) * noise;
      const val = perDayBase * drift * jitter;
      out.push({ day: d.toISOString().slice(0, 10), value: Math.max(0, val) });
    }
    return out;
  };

  const current = build(0);
  const previous = build(range);

  const totalOf = (arr: SeriesPoint[]) => {
    if (AVERAGED.has(metricId)) {
      return arr.reduce((s, p) => s + p.value, 0) / Math.max(arr.length, 1);
    }
    return arr.reduce((s, p) => s + p.value, 0);
  };

  const currentTotal = totalOf(current);
  const previousTotal = totalOf(previous);
  const delta = previousTotal > 0 ? (currentTotal - previousTotal) / previousTotal : 0;

  return { current, previous, currentTotal, previousTotal, delta };
}

// ---------- Formatting ----------

export function formatMetric(value: number, format: MetricFormat): string {
  if (!Number.isFinite(value)) return "—";
  switch (format) {
    case "percent":
      return `${(value * 100).toFixed(value < 0.1 ? 2 : 1)}%`;
    case "currency":
      return value >= 10_000
        ? `$${(value / 1000).toFixed(1)}k`
        : value.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
    case "duration": {
      // value is minutes
      if (value >= 60 * 24) return `${(value / (60 * 24)).toFixed(1)}d`;
      if (value >= 60) return `${(value / 60).toFixed(1)}h`;
      return `${Math.round(value)}m`;
    }
    case "multiplier":
      return `${value.toFixed(2)}x`;
    case "number":
    default:
      if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
      if (value >= 10_000) return `${(value / 1000).toFixed(1)}k`;
      return Math.round(value).toLocaleString();
  }
}

export function formatDelta(delta: number): string {
  if (!Number.isFinite(delta) || delta === 0) return "0%";
  const sign = delta > 0 ? "+" : "";
  return `${sign}${(delta * 100).toFixed(1)}%`;
}
