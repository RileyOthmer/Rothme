import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { fallback } from "@tanstack/zod-adapter";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

import { AppHeader } from "@/components/layout/AppHeader";
import { AnalyticsHubNav } from "@/features/analytics/AnalyticsHubNav";
import { PlatformSelector } from "@/features/analytics/PlatformSelector";
import { ExecutiveDateFilter } from "@/features/analytics/ExecutiveDateFilter";
import { AiInsightsStrip } from "@/features/analytics/AiInsightsStrip";
import { ModeSwitcher, type AnalyticsMode } from "@/features/analytics/ModeSwitcher";
import { ChartFrame } from "@/features/analytics/charts/ChartFrame";
import {
  GenericAreaChart, GenericBarChart, GenericLineChart, GenericPieChart,
} from "@/features/analytics/charts/GenericCharts";
import {
  PLATFORMS, PLATFORM_MAP, delta, formatNumber, formatPercent,
  rangeToDates, unifiedAnalytics,
  type PlatformId, type RangePreset,
} from "@/features/unified/platforms";
import { cn } from "@/lib/utils";

const platformIds = PLATFORMS.map((p) => p.id) as [PlatformId, ...PlatformId[]];

const searchSchema = z.object({
  range: fallback(z.enum(["today", "yesterday", "7d", "30d", "90d", "1y", "custom"]), "30d").default("30d"),
  from: fallback(z.string(), "").default(""),
  to: fallback(z.string(), "").default(""),
  platforms: fallback(z.array(z.enum(platformIds)), [] as PlatformId[]).default([]),
});

export const Route = createFileRoute("/_authenticated/analytics/overview")({
  head: () => ({
    meta: [
      { title: "Overview — Velora Analytics Center" },
      { name: "description", content: "The complete cross-platform executive view: KPIs, growth, platform mix, and an AI strategist summary — all in one glance." },
    ],
  }),
  validateSearch: (s) => searchSchema.parse(s),
  component: OverviewPage,
});

function OverviewPage() {
  const { range, from, to, platforms } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const [mode, setMode] = useState<AnalyticsMode>("unified");

  const dates = useMemo(
    () => rangeToDates(range as RangePreset, { from: from || undefined, to: to || undefined }),
    [range, from, to],
  );
  const result = useMemo(
    () => unifiedAnalytics(platforms as PlatformId[], dates.days, dates.from),
    [platforms, dates.days, dates.from],
  );

  const activeIds = (platforms.length ? platforms : PLATFORMS.map((p) => p.id)) as PlatformId[];

  const kpis = [
    { label: "Reach",           value: result.totals.reach,           previous: result.previous.reach,           format: "n" as const },
    { label: "Impressions",     value: result.totals.impressions,     previous: result.previous.impressions,     format: "n" as const },
    { label: "Engagement",      value: result.totals.engagement,      previous: result.previous.engagement,      format: "n" as const },
    { label: "Engagement rate", value: result.totals.engagementRate,  previous: result.previous.engagementRate,  format: "p" as const },
    { label: "Followers",       value: result.totals.followers,       previous: result.previous.followers,       format: "n" as const },
    { label: "New followers",   value: result.totals.followerGrowth,  previous: result.previous.followerGrowth,  format: "n" as const },
    { label: "Posts",           value: result.totals.posts,           previous: result.previous.posts,           format: "n" as const },
    { label: "Link clicks",     value: result.totals.clicks,          previous: result.previous.clicks,          format: "n" as const },
  ];

  const chartSeries = activeIds.map((id) => ({
    key: id, color: PLATFORM_MAP[id].color, label: PLATFORM_MAP[id].label,
  }));

  const platformComparison = result.perPlatform.map((p) => ({
    platform: PLATFORM_MAP[p.platform].label,
    Reach: p.reach,
    Engagement: p.engagement,
  }));

  const mixTotal = result.perPlatform.reduce((s, p) => s + p.reach, 0) || 1;
  const platformMix = result.perPlatform.map((p) => ({
    name: PLATFORM_MAP[p.platform].label,
    value: Math.round((p.reach / mixTotal) * 100),
    color: PLATFORM_MAP[p.platform].color,
  }));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Analytics · Executive
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
              Executive Dashboard
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              The full picture across every connected platform, in one view.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <PlatformSelector
              value={platforms as PlatformId[]}
              onChange={(v) => navigate({ search: (prev: any) => ({ ...prev, platforms: v }), replace: true })}
            />
            <ExecutiveDateFilter
              range={range as RangePreset} from={from} to={to}
              onChange={(v) => navigate({ search: (prev: any) => ({ ...prev, ...v }), replace: true })}
            />
          </div>
        </div>

        <AnalyticsHubNav />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <ModeSwitcher value={mode} onChange={setMode} disabledModes={["comparison"]} />
          <p className="text-xs text-muted-foreground">
            {mode === "unified" && "Every connected platform merged into one view."}
            {mode === "platform" && "Native metrics only — pick a platform above."}
            {mode === "comparison" && "Side-by-side comparison — ships in Phase 2."}
          </p>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {kpis.map((k) => {
            const d = delta(k.value, k.previous);
            const arrow = d > 0.005 ? "up" : d < -0.005 ? "down" : "flat";
            const tone = arrow === "up" ? "text-emerald-600" : arrow === "down" ? "text-red-600" : "text-muted-foreground";
            return (
              <div key={k.label} className="rounded-lg border border-border bg-card p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{k.label}</p>
                <p className="mt-1.5 text-2xl font-semibold tabular-nums">
                  {k.format === "p" ? formatPercent(k.value) : formatNumber(k.value)}
                </p>
                <p className={cn("mt-1 flex items-center gap-1 text-xs font-medium tabular-nums", tone)}>
                  {arrow === "up" && <ArrowUpRight className="h-3 w-3" />}
                  {arrow === "down" && <ArrowDownRight className="h-3 w-3" />}
                  {arrow === "flat" && <Minus className="h-3 w-3" />}
                  {Math.abs(d * 100).toFixed(1)}% vs previous
                </p>
              </div>
            );
          })}
        </div>

        {/* AI Insights */}
        <AiInsightsStrip
          range={range}
          platforms={activeIds.map((id) => PLATFORM_MAP[id].label)}
          kpis={kpis.map((k) => ({ label: k.label, value: k.value, previous: k.previous }))}
        />

        {/* Charts */}
        <div className="grid gap-4 lg:grid-cols-2">
          <ChartFrame
            title="Reach over time"
            subtitle={`${activeIds.length} platform${activeIds.length === 1 ? "" : "s"} · ${dates.days} day${dates.days === 1 ? "" : "s"}`}
            csvFilename="reach-over-time"
            csvRows={result.series as any}
            className="lg:col-span-2"
          >
            <GenericAreaChart data={result.series} xKey="day" series={chartSeries} stacked />
          </ChartFrame>

          <ChartFrame
            title="Platform comparison"
            subtitle="Reach vs Engagement, current period"
            csvFilename="platform-comparison"
            csvRows={platformComparison}
          >
            <GenericBarChart
              data={platformComparison} xKey="platform"
              series={[
                { key: "Reach",      color: "hsl(var(--primary))" },
                { key: "Engagement", color: "hsl(200 82% 55%)" },
              ]}
            />
          </ChartFrame>

          <ChartFrame
            title="Reach mix"
            subtitle="Share of total reach by platform"
            csvFilename="reach-mix"
            csvRows={platformMix.map((m) => ({ platform: m.name, share_pct: m.value }))}
          >
            <GenericPieChart data={platformMix} donut />
          </ChartFrame>

          <ChartFrame
            title="Engagement trend"
            subtitle="Daily engagement across selected platforms"
            csvFilename="engagement-trend"
            csvRows={result.series as any}
            className="lg:col-span-2"
          >
            <GenericLineChart data={result.series} xKey="day" series={chartSeries} />
          </ChartFrame>
        </div>

        <p className="pt-4 text-xs text-muted-foreground">
          Data shown is deterministic sample data until live platform sync is connected. Install and verify plugins in{" "}
          <span className="font-mono">Settings → Plugins</span> to replace with real numbers.
        </p>
      </main>
    </div>
  );
}
