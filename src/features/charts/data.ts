// Deterministic mock datasets for the interactive charts.
// Real data will flow from the unified MetricSnapshot layer later.

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}
function seeded(seed: number) {
  let s = seed || 1;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export type RangeDays = 7 | 14 | 30 | 90;

export type PlatformKey =
  | "instagram" | "tiktok" | "linkedin" | "youtube" | "facebook" | "x" | "pinterest";

export const PLATFORMS: { id: PlatformKey; label: string; color: string }[] = [
  { id: "instagram", label: "Instagram", color: "hsl(340 82% 60%)" },
  { id: "tiktok",    label: "TikTok",    color: "hsl(180 82% 45%)" },
  { id: "linkedin",  label: "LinkedIn",  color: "hsl(210 82% 52%)" },
  { id: "youtube",   label: "YouTube",   color: "hsl(0 82% 58%)" },
  { id: "facebook",  label: "Facebook",  color: "hsl(220 82% 60%)" },
  { id: "x",         label: "X",         color: "hsl(0 0% 60%)" },
  { id: "pinterest", label: "Pinterest", color: "hsl(355 82% 55%)" },
];

// Performance over time — one line per platform (subset selectable).
export function performanceSeries(range: RangeDays, platforms: PlatformKey[]) {
  const rows: Array<Record<string, number | string>> = [];
  for (let i = 0; i < range; i++) {
    const d = new Date(Date.now() - (range - 1 - i) * 86_400_000);
    const row: Record<string, number | string> = { day: d.toISOString().slice(5, 10) };
    for (const p of platforms) {
      const rand = seeded(hash(p + i));
      const trend = 1 + (i / range) * 0.35;
      const base = { instagram: 4200, tiktok: 6100, linkedin: 1800, youtube: 3300, facebook: 2400, x: 1200, pinterest: 900 }[p];
      row[p] = Math.round(base * trend * (0.75 + rand() * 0.5));
    }
    rows.push(row);
  }
  return rows;
}

// Platform comparison — grouped bars.
export function platformComparison() {
  return PLATFORMS.map((p) => {
    const rand = seeded(hash(p.id + "cmp"));
    return {
      platform: p.label,
      color: p.color,
      reach:      Math.round(30_000 + rand() * 220_000),
      engagement: Math.round(1_200  + rand() * 18_000),
      clicks:     Math.round(400    + rand() * 6_800),
    };
  });
}

// Audience demographics — donut.
export const demographics = [
  { name: "18–24", value: 22, color: "hsl(270 82% 62%)" },
  { name: "25–34", value: 38, color: "hsl(210 82% 55%)" },
  { name: "35–44", value: 21, color: "hsl(180 72% 45%)" },
  { name: "45–54", value: 12, color: "hsl(140 62% 45%)" },
  { name: "55+",   value:  7, color: "hsl(30 82% 55%)"  },
];

// Best posting times — 7×24 heatmap.
export const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
export function heatmapData() {
  const cells: { day: string; hour: number; value: number }[] = [];
  for (let d = 0; d < 7; d++) {
    for (let h = 0; h < 24; h++) {
      const rand = seeded(hash(`${d}-${h}`));
      // Weekday mornings + evenings peak; weekend afternoons peak.
      const isWeekend = d >= 5;
      const morning = Math.exp(-Math.pow((h - 9) / 3, 2));
      const evening = Math.exp(-Math.pow((h - 20) / 2.5, 2));
      const afternoon = Math.exp(-Math.pow((h - 15) / 3, 2));
      const shape = isWeekend ? afternoon * 1.1 : morning * 0.9 + evening;
      const val = Math.min(1, shape * (0.75 + rand() * 0.5));
      cells.push({ day: DAYS[d], hour: h, value: val });
    }
  }
  return cells;
}

// Marketing funnel.
export const funnelStages = [
  { stage: "Impressions", value: 812_900, color: "hsl(210 82% 55%)" },
  { stage: "Reach",       value: 312_400, color: "hsl(200 78% 50%)" },
  { stage: "Clicks",      value:  42_180, color: "hsl(190 72% 46%)" },
  { stage: "Sessions",    value:  36_540, color: "hsl(180 68% 42%)" },
  { stage: "Add to cart", value:   5_820, color: "hsl(160 62% 42%)" },
  { stage: "Conversions", value:   1_240, color: "hsl(140 62% 42%)" },
];

// Organic vs Paid growth — stacked area.
export function organicVsPaid(range: RangeDays) {
  const rows: { day: string; organic: number; paid: number }[] = [];
  for (let i = 0; i < range; i++) {
    const d = new Date(Date.now() - (range - 1 - i) * 86_400_000);
    const rand = seeded(hash("op" + i));
    const trend = 1 + (i / range) * 0.4;
    rows.push({
      day: d.toISOString().slice(5, 10),
      organic: Math.round(3200 * trend * (0.8 + rand() * 0.4)),
      paid:    Math.round(1800 * trend * (0.7 + rand() * 0.6)),
    });
  }
  return rows;
}

// Geographic distribution — top countries with rough map coordinates (0–100 %).
export const geography = [
  { code: "US", country: "United States",  visitors: 18_420, x: 22, y: 38 },
  { code: "GB", country: "United Kingdom", visitors:  6_310, x: 46, y: 30 },
  { code: "DE", country: "Germany",        visitors:  4_820, x: 51, y: 32 },
  { code: "FR", country: "France",         visitors:  4_120, x: 48, y: 34 },
  { code: "BR", country: "Brazil",         visitors:  3_640, x: 34, y: 66 },
  { code: "IN", country: "India",          visitors:  3_310, x: 68, y: 46 },
  { code: "JP", country: "Japan",          visitors:  2_910, x: 84, y: 40 },
  { code: "AU", country: "Australia",      visitors:  2_140, x: 84, y: 70 },
  { code: "CA", country: "Canada",         visitors:  1_880, x: 22, y: 26 },
  { code: "MX", country: "Mexico",         visitors:  1_520, x: 20, y: 48 },
];

// Campaigns.
export const campaigns = [
  { name: "Spring Launch",    spend: 12_400, revenue: 41_200, roas: 3.32, ctr: 2.4 },
  { name: "Retargeting Q2",   spend:  8_100, revenue: 29_700, roas: 3.67, ctr: 3.1 },
  { name: "Brand Awareness",  spend: 15_600, revenue: 22_900, roas: 1.47, ctr: 1.2 },
  { name: "Creator Boost",    spend:  6_300, revenue: 24_800, roas: 3.94, ctr: 3.6 },
  { name: "Holiday Warm-up",  spend:  9_700, revenue: 31_400, roas: 3.24, ctr: 2.8 },
];

// Goals — radial progress.
export const goals = [
  { name: "Followers",   value: 82, target: 100, color: "hsl(210 82% 55%)" },
  { name: "Revenue",     value: 64, target: 100, color: "hsl(150 62% 45%)" },
  { name: "Engagement",  value: 91, target: 100, color: "hsl(280 72% 60%)" },
  { name: "New leads",   value: 47, target: 100, color: "hsl(30 82% 55%)"  },
];
