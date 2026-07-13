// Unified analytics — platform registry + deterministic mock aggregator.
// Real numbers will replace this once MetricSnapshot ingestion goes live.

import {
  Instagram, Facebook, Music2, MessageCircle, Twitter, Linkedin,
  Youtube, MapPin, Cloud, AtSign, PinIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type PlatformId =
  | "instagram" | "facebook" | "tiktok" | "threads" | "x" | "linkedin"
  | "pinterest" | "youtube" | "gbp" | "bluesky" | "mastodon";

export type Platform = {
  id: PlatformId;
  label: string;
  color: string;
  Icon: LucideIcon;
};

export const PLATFORMS: Platform[] = [
  { id: "instagram", label: "Instagram",          color: "hsl(340 82% 60%)", Icon: Instagram },
  { id: "facebook",  label: "Facebook",           color: "hsl(220 82% 60%)", Icon: Facebook },
  { id: "tiktok",    label: "TikTok",             color: "hsl(180 82% 45%)", Icon: Music2 },
  { id: "threads",   label: "Threads",            color: "hsl(0 0% 20%)",    Icon: MessageCircle },
  { id: "x",         label: "X",                  color: "hsl(0 0% 40%)",    Icon: Twitter },
  { id: "linkedin",  label: "LinkedIn",           color: "hsl(210 82% 45%)", Icon: Linkedin },
  { id: "pinterest", label: "Pinterest",          color: "hsl(355 82% 55%)", Icon: PinIcon },
  { id: "youtube",   label: "YouTube",            color: "hsl(0 82% 58%)",   Icon: Youtube },
  { id: "gbp",       label: "Google Business",    color: "hsl(150 62% 45%)", Icon: MapPin },
  { id: "bluesky",   label: "Bluesky",            color: "hsl(200 82% 55%)", Icon: Cloud },
  { id: "mastodon",  label: "Mastodon",           color: "hsl(260 62% 55%)", Icon: AtSign },
];

export const PLATFORM_MAP: Record<PlatformId, Platform> = Object.fromEntries(
  PLATFORMS.map((p) => [p.id, p]),
) as Record<PlatformId, Platform>;

// ---------- Range presets ----------

export type RangePreset = "today" | "yesterday" | "7d" | "30d" | "90d" | "1y" | "custom";

export const RANGE_LABEL: Record<RangePreset, string> = {
  today:     "Today",
  yesterday: "Yesterday",
  "7d":      "Last 7 days",
  "30d":     "Last 30 days",
  "90d":     "Last 90 days",
  "1y":      "Last 12 months",
  custom:    "Custom",
};

const DAY = 86_400_000;

export function rangeToDates(
  preset: RangePreset,
  custom?: { from?: string; to?: string },
): { from: Date; to: Date; days: number } {
  const now = new Date();
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  switch (preset) {
    case "today":     return { from: startOfToday, to: endOfToday, days: 1 };
    case "yesterday": return { from: new Date(startOfToday.getTime() - DAY), to: new Date(startOfToday.getTime() - 1), days: 1 };
    case "7d":        return { from: new Date(startOfToday.getTime() - 6 * DAY),  to: endOfToday, days: 7 };
    case "30d":       return { from: new Date(startOfToday.getTime() - 29 * DAY), to: endOfToday, days: 30 };
    case "90d":       return { from: new Date(startOfToday.getTime() - 89 * DAY), to: endOfToday, days: 90 };
    case "1y":        return { from: new Date(startOfToday.getTime() - 364 * DAY), to: endOfToday, days: 365 };
    case "custom": {
      const from = custom?.from ? new Date(custom.from) : new Date(startOfToday.getTime() - 6 * DAY);
      const to = custom?.to ? new Date(custom.to) : endOfToday;
      const days = Math.max(1, Math.round((to.getTime() - from.getTime()) / DAY) + 1);
      return { from, to, days };
    }
  }
}

// ---------- Deterministic mock data ----------

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}
function seeded(seed: number) {
  let s = seed || 1;
  return () => (s = (s * 9301 + 49297) % 233280) / 233280;
}

// Per-day baseline reach for each platform (rough real-world ordering).
const BASE_DAILY: Record<PlatformId, number> = {
  instagram: 5800, facebook: 4100, tiktok: 7200, threads: 1600, x: 2100,
  linkedin: 2400, pinterest: 1900, youtube: 3300, gbp: 900, bluesky: 620, mastodon: 380,
};

export type PlatformKpis = {
  platform: PlatformId;
  reach: number;
  impressions: number;
  engagement: number;    // interactions
  engagementRate: number; // 0..1
  followers: number;      // total at end of range
  followerGrowth: number; // delta over range
  posts: number;
  clicks: number;
};

export type UnifiedResult = {
  from: Date;
  to: Date;
  days: number;
  perPlatform: PlatformKpis[];
  series: Array<{ day: string } & Partial<Record<PlatformId, number>>>;
  totals: {
    reach: number;
    impressions: number;
    engagement: number;
    engagementRate: number;
    followers: number;
    followerGrowth: number;
    posts: number;
    clicks: number;
  };
  previous: {
    reach: number;
    impressions: number;
    engagement: number;
    engagementRate: number;
    followers: number;
    followerGrowth: number;
    posts: number;
    clicks: number;
  };
};

function computePlatform(id: PlatformId, days: number, offsetDays = 0): PlatformKpis {
  const rand = seeded(hash(id + ":" + days + ":" + offsetDays));
  const base = BASE_DAILY[id];
  const trend = 1 + (rand() - 0.4) * 0.3;
  const reach = Math.round(base * days * trend * (0.85 + rand() * 0.3));
  const impressions = Math.round(reach * (1.6 + rand() * 0.9));
  const engagementRate = 0.02 + rand() * 0.07;
  const engagement = Math.round(reach * engagementRate);
  const followers = Math.round(base * 12 * (0.8 + rand() * 0.6));
  const followerGrowth = Math.round(base * days * 0.02 * (0.5 + rand()));
  const posts = Math.max(1, Math.round(days * (0.4 + rand() * 0.8)));
  const clicks = Math.round(engagement * (0.25 + rand() * 0.4));
  return { platform: id, reach, impressions, engagement, engagementRate, followers, followerGrowth, posts, clicks };
}

export function unifiedAnalytics(
  selected: PlatformId[],
  days: number,
  from: Date,
): UnifiedResult {
  const to = new Date(from.getTime() + (days - 1) * DAY);
  const active = selected.length ? selected : PLATFORMS.map((p) => p.id);

  const perPlatform = active.map((id) => computePlatform(id, days, 0));
  const prevPlatform = active.map((id) => computePlatform(id, days, days));

  const totalsOf = (rows: PlatformKpis[]) => {
    const reach = rows.reduce((s, r) => s + r.reach, 0);
    const impressions = rows.reduce((s, r) => s + r.impressions, 0);
    const engagement = rows.reduce((s, r) => s + r.engagement, 0);
    const followers = rows.reduce((s, r) => s + r.followers, 0);
    const followerGrowth = rows.reduce((s, r) => s + r.followerGrowth, 0);
    const posts = rows.reduce((s, r) => s + r.posts, 0);
    const clicks = rows.reduce((s, r) => s + r.clicks, 0);
    return {
      reach, impressions, engagement,
      engagementRate: reach ? engagement / reach : 0,
      followers, followerGrowth, posts, clicks,
    };
  };

  // Daily series: distribute the per-platform total across the range with jitter.
  const series: UnifiedResult["series"] = [];
  const bucketSize = days > 90 ? 7 : 1;
  const buckets = Math.ceil(days / bucketSize);
  for (let b = 0; b < buckets; b++) {
    const d = new Date(from.getTime() + b * bucketSize * DAY);
    const row: { day: string } & Partial<Record<PlatformId, number>> = {
      day: days <= 1
        ? `${d.getHours().toString().padStart(2, "0")}:00`
        : d.toISOString().slice(5, 10),
    };
    for (const p of perPlatform) {
      const rand = seeded(hash(p.platform + ":b:" + b));
      const share = (p.reach / buckets) * (0.7 + rand() * 0.6);
      row[p.platform] = Math.round(share);
    }
    series.push(row);
  }

  // For a 1-day view, synthesise 24 hourly points from the daily total.
  if (days <= 1) {
    series.length = 0;
    for (let h = 0; h < 24; h++) {
      const row: { day: string } & Partial<Record<PlatformId, number>> = {
        day: `${h.toString().padStart(2, "0")}:00`,
      };
      for (const p of perPlatform) {
        const rand = seeded(hash(p.platform + ":h:" + h));
        const shape = 0.3 + Math.exp(-Math.pow((h - 14) / 5, 2)) * 1.4;
        row[p.platform] = Math.round((p.reach / 24) * shape * (0.7 + rand() * 0.6));
      }
      series.push(row);
    }
  }

  return {
    from,
    to,
    days,
    perPlatform,
    series,
    totals: totalsOf(perPlatform),
    previous: totalsOf(prevPlatform),
  };
}

export function formatNumber(v: number): string {
  if (!Number.isFinite(v)) return "—";
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 10_000)    return `${(v / 1000).toFixed(1)}k`;
  return Math.round(v).toLocaleString();
}

export function formatPercent(v: number): string {
  if (!Number.isFinite(v)) return "—";
  return `${(v * 100).toFixed(1)}%`;
}

export function delta(cur: number, prev: number): number {
  if (!prev) return 0;
  return (cur - prev) / prev;
}
