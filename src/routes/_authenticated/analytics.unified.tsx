import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { z } from "zod";
import { fallback } from "@tanstack/zod-adapter";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Legend,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { AppHeader } from "@/components/layout/AppHeader";
import { UnifiedFilters } from "@/features/unified/UnifiedFilters";
import {
  PLATFORMS, PLATFORM_MAP, delta, formatNumber, formatPercent,
  rangeToDates, unifiedAnalytics,
  type PlatformId, type RangePreset,
} from "@/features/unified/platforms";
import { EmptyDataState, ZeroStatGrid } from "@/components/dashboard/EmptyDataState";
import { useHasConnections } from "@/hooks/use-has-connections";
import { useHasMetrics } from "@/hooks/use-has-metrics";

const platformIds = PLATFORMS.map((p) => p.id) as [PlatformId, ...PlatformId[]];

const searchSchema = z.object({
  range: fallback(z.enum(["today", "yesterday", "7d", "30d", "90d", "1y", "custom"]), "30d").default("30d"),
  from: fallback(z.string(), "").default(""),
  to: fallback(z.string(), "").default(""),
  platforms: fallback(z.array(z.enum(platformIds)), [] as PlatformId[]).default([]),
});

export const Route = createFileRoute("/_authenticated/analytics/unified")({
  head: () => ({
    meta: [
      { title: "Unified analytics — ROTHME" },
      {
        name: "description",
        content:
          "Every connected social platform in one view. Compare Instagram, TikTok, LinkedIn, YouTube and more, or dive into a single channel — with any date range.",
      },
    ],
  }),
  validateSearch: (s) => searchSchema.parse(s),
  component: UnifiedPage,
});

function UnifiedPage() {
  const { range, from, to, platforms } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { hasConnections, isLoading: connLoading } = useHasConnections();
  const { hasMetrics, isLoading: metricsLoading } = useHasMetrics();
  const showEmpty = !connLoading && !metricsLoading && (!hasConnections || !hasMetrics);

  const dates = useMemo(
    () => rangeToDates(range as RangePreset, { from: from || undefined, to: to || undefined }),
    [range, from, to],
  );

  const result = useMemo(
    () => unifiedAnalytics(platforms as PlatformId[], dates.days, dates.from),
    [platforms, dates.days, dates.from],
  );

  const activeIds = platforms.length ? (platforms as PlatformId[]) : PLATFORMS.map((p) => p.id);
  const isAll = platforms.length === 0;

  const kpis = [
    { label: "Reach",           value: formatNumber(result.totals.reach),          d: delta(result.totals.reach, result.previous.reach) },
    { label: "Impressions",     value: formatNumber(result.totals.impressions),    d: delta(result.totals.impressions, result.previous.impressions) },
    { label: "Engagement",      value: formatNumber(result.totals.engagement),     d: delta(result.totals.engagement, result.previous.engagement) },
    { label: "Engagement rate", value: formatPercent(result.totals.engagementRate),d: delta(result.totals.engagementRate, result.previous.engagementRate) },
    { label: "Followers",       value: formatNumber(result.totals.followers),      d: delta(result.totals.followers, result.previous.followers) },
    { label: "New followers",   value: formatNumber(result.totals.followerGrowth), d: delta(result.totals.followerGrowth, result.previous.followerGrowth) },
    { label: "Posts",           value: formatNumber(result.totals.posts),          d: delta(result.totals.posts, result.previous.posts) },
    { label: "Link clicks",     value: formatNumber(result.totals.clicks),         d: delta(result.totals.clicks, result.previous.clicks) },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6 sm:py-14">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Analytics · Unified
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              {isAll ? "Every channel, together." : `${activeIds.length === 1 ? PLATFORM_MAP[activeIds[0]].label : `${activeIds.length} channels`} in focus.`}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              {isAll
                ? "Combined performance across all connected platforms."
                : "Filtered to your selected platforms only. Add more to compare."}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/analytics/charts" search={{ range: 30 }} className="text-xs font-medium text-primary underline-offset-4 hover:underline">
              Chart gallery →
            </Link>
            <UnifiedFilters
              value={{
                platforms: platforms as PlatformId[],
                range: range as RangePreset,
                customFrom: from || undefined,
                customTo: to || undefined,
              }}
              onChange={(v) =>
                navigate({
                  search: () => ({
                    range: v.range,
                    from: v.customFrom ?? "",
                    to: v.customTo ?? "",
                    platforms: v.platforms,
                  }),
                  replace: true,
                })
              }
            />
          </div>
        </header>

        {showEmpty ? (
          <>
            <ZeroStatGrid labels={kpis.map((k) => k.label)} />
            <EmptyDataState
              title={hasConnections ? "No analytics yet" : "No platforms connected"}
              description={
                hasConnections
                  ? "Your platforms are connected but no metrics have been synced yet. Numbers will appear here as soon as the first sync completes."
                  : "Connect a social account, ad platform, or website provider and this view will populate with your real numbers."
              }
            />
          </>
        ) : (
          <>
        {/* KPI grid */}
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {kpis.map((k) => {
            const up = k.d >= 0;
            return (
              <div key={k.label} className="rounded-2xl border border-border/60 bg-card/50 p-4 animate-fade-in">
                <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">{k.label}</p>
                <p className="mt-2 text-2xl font-semibold tabular-nums">{k.value}</p>
                <p className={`mt-1 inline-flex items-center gap-0.5 text-xs font-medium ${up ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                  {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {(k.d * 100).toFixed(1)}% vs previous
                </p>
              </div>
            );
          })}
        </section>

        {/* Stacked area — combined reach over time */}
        <section className="rounded-2xl border border-border/60 bg-card/50">
          <header className="flex items-center justify-between border-b border-border/50 px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold">Reach over time</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {dates.from.toLocaleDateString()} → {dates.to.toLocaleDateString()} · {dates.days === 1 ? "hourly" : "daily"}
              </p>
            </div>
          </header>
          <div className="h-72 px-3 py-4">
            <ResponsiveContainer>
              <AreaChart data={result.series} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <defs>
                  {result.perPlatform.map((p) => (
                    <linearGradient key={p.platform} id={`u-${p.platform}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={PLATFORM_MAP[p.platform].color} stopOpacity={0.65} />
                      <stop offset="100%" stopColor={PLATFORM_MAP[p.platform].color} stopOpacity={0.05} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} width={44} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 10,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {result.perPlatform.map((p) => (
                  <Area
                    key={p.platform}
                    type="monotone"
                    dataKey={p.platform}
                    name={PLATFORM_MAP[p.platform].label}
                    stackId="1"
                    stroke={PLATFORM_MAP[p.platform].color}
                    fill={`url(#u-${p.platform})`}
                    animationDuration={600}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Per-platform breakdown */}
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <div className="rounded-2xl border border-border/60 bg-card/50 lg:col-span-3">
            <header className="flex items-center justify-between border-b border-border/50 px-5 py-4">
              <h2 className="text-sm font-semibold">Engagement by platform</h2>
              <span className="text-xs text-muted-foreground">This period</span>
            </header>
            <div className="h-72 px-3 py-4">
              <ResponsiveContainer>
                <BarChart
                  data={result.perPlatform.map((p) => ({
                    name: PLATFORM_MAP[p.platform].label,
                    engagement: p.engagement,
                    reach: p.reach,
                    color: PLATFORM_MAP[p.platform].color,
                  }))}
                  layout="vertical"
                  margin={{ top: 4, right: 16, left: 8, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} tickFormatter={formatNumber} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} width={90} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 10,
                      fontSize: 12,
                    }}
                    formatter={(v: number) => v.toLocaleString()}
                    cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
                  />
                  <Bar dataKey="engagement" name="Engagement" radius={[0, 6, 6, 0]} animationDuration={600}>
                    {result.perPlatform.map((p) => (
                      <rect key={p.platform} fill={PLATFORM_MAP[p.platform].color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card/50 lg:col-span-2">
            <header className="flex items-center justify-between border-b border-border/50 px-5 py-4">
              <h2 className="text-sm font-semibold">Per-platform snapshot</h2>
            </header>
            <ul className="divide-y divide-border/50">
              {result.perPlatform.map((p) => {
                const meta = PLATFORM_MAP[p.platform];
                return (
                  <li key={p.platform} className="flex items-center gap-3 px-5 py-3">
                    <span
                      className="grid h-8 w-8 place-items-center rounded-lg text-white"
                      style={{ background: meta.color }}
                    >
                      <meta.Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{meta.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatNumber(p.reach)} reach · {formatPercent(p.engagementRate)} eng
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold tabular-nums">{formatNumber(p.followers)}</p>
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
                        +{formatNumber(p.followerGrowth)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        <footer className="pt-2 text-xs text-muted-foreground">
          Connect more channels in{" "}
          <Link to="/settings/connections" className="underline underline-offset-4 hover:text-foreground">
            Settings → Connections
          </Link>{" "}
          to enrich this view.
        </footer>
      </main>
    </div>
  );
}
