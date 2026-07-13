# Enterprise Analytics Engine — Build Plan

Another huge scope (9 sub-hubs × 12+ chart types × 11 platforms × comparison + AI + custom dashboards + 4 export formats). Shipping it all at once produces a hollow shell. I want to build in layers that each work end-to-end.

## The core principle (matches the rest of Velora)

Analytics is **plugin-driven and data-driven**. Zero platform-specific components in the core:

- Every platform's metrics come from `metric_snapshots` (already exists) + `platform_kpi_mappings` (already exists via Dev Center).
- The Analytics UI reads *what KPIs a plugin exposes* from the DB and renders the matching cards/charts generically.
- Adding a new platform to analytics = installing its plugin + mapping its KPIs. No code changes.

This also means: platform-specific dashboards (Instagram followers/reach/etc., TikTok watch time, YouTube retention) are **not hardcoded** — they're rendered from each plugin's KPI mapping.

## Phased delivery

### Phase 1 — Analytics Hub shell + Executive Dashboard + Platform Selector (this turn)

- `/analytics` becomes the hub with sub-nav for the 9 sections
- Platform selector (All + 11 platforms) reads from installed plugins — greyed-out for non-installed, live for installed
- **Executive Dashboard**: KPI cards with period-over-period deltas, a growth line chart, a platform-comparison bar chart, a source pie chart, an AI summary strip
- **Date filters**: Today / Yesterday / 7 / 30 / 90 / YTD / Custom (via Popover + Calendar)
- Generic chart primitives (Line, Bar, Area, StackedArea, Pie, Donut, KpiCard) built on Recharts (already in the stack) with hover tooltips, fullscreen, PNG + CSV export, dark/light mode
- Reads live `metric_snapshots` where present; falls back to the existing mock generator when a platform has no rows yet, clearly badged "Sample data"
- **AI Insights** hook: uses the existing `strategist-prompt` + Lovable AI Gateway to summarize the visible date range for the visible platform

Delivers a real, shippable analytics experience end-to-end for at least one platform.

### Phase 2 — Platform Analytics + Content/Audience/Ad/Revenue sub-hubs
- Per-platform dashboard rendered from KPI mapping metadata (no hardcoded platform components)
- Content Analytics: top posts table, engagement scatter, best-posting-times heatmap
- Audience Analytics: demographics donut, geography choropleth (react-simple-maps), growth area chart
- Ad Analytics: campaign bar/bubble, spend vs ROAS scatter, funnel
- Revenue Analytics: revenue area, source breakdown, LTV bar

### Phase 3 — Comparison Mode + Custom Reports
- Side-by-side compare (any two platforms / campaigns / periods)
- Report builder: pick KPIs + charts + date range → save as named report
- Export pipeline: CSV (browser Blob), PDF (server route → pdfkit), Excel (xlsx), PowerPoint (pptxgenjs)

### Phase 4 — Custom Dashboards
- Drag-and-drop widget grid (react-grid-layout), resize, hide, save layouts per user, multiple named dashboards

### Phase 5 — Realtime + Enterprise polish
- Live update via Supabase realtime on `metric_snapshots`
- Cached aggregates for large datasets
- Scheduled report delivery via existing weekly-reports pipeline

## What Phase 1 delivers today

**Files**
- `src/routes/_authenticated/analytics.tsx` — becomes the hub (currently a stub); adds sub-nav for the 9 sections. Existing `analytics.unified.tsx`, `analytics.charts.tsx`, `analytics.$metric.tsx` stay as leaves under it.
- `src/routes/_authenticated/analytics.executive.tsx` — Executive Dashboard leaf
- `src/features/analytics/PlatformSelector.tsx` — reads installed plugins
- `src/features/analytics/DateRangeFilter.tsx` — Today / Yesterday / 7 / 30 / 90 / YTD / Custom
- `src/features/analytics/charts/` — `KpiCard`, `LineChart`, `BarChart`, `AreaChart`, `StackedAreaChart`, `PieChart`, `DonutChart` (all with export/fullscreen)
- `src/features/analytics/AiInsightsStrip.tsx`
- `src/lib/analytics/analytics.functions.ts` — `getExecutiveSummary({ platforms, from, to })` server fn that reads `metric_snapshots` + falls back to mocks per-platform
- No new tables — reuses existing `metric_snapshots`, `platform_kpi_mappings`, `plugin_installations`

**Guardrails I'll hold**
- Zero hardcoded platform names inside components — everything comes from `plugin_registry` / `plugin_installations`
- Every chart passes chart-type prop + data prop; no bespoke chart per platform
- All exports (CSV/PNG in Phase 1) work client-side; PDF/XLSX/PPT come in Phase 3

## Confirm

Reply **"go"** to build Phase 1 as scoped.
Reply with edits to change scope (e.g. "skip AI strip", "start with Platform Analytics not Executive", "combine phases 1+2").
