# Enterprise Analytics Center — Phased Plan

The scope you listed (16 sub-hubs, ~30 chart types, 25 platforms, 3 modes, custom dashboards, AI insights, report builder, forecasting, alerts, developer mode, real-time) is roughly 3–4 months of work for a full team. Shipping it in one turn would produce a shell that looks impressive and breaks on click.

I'll build it phase-by-phase, each phase leaving the app in a working, premium state. The Executive Dashboard from the previous turn becomes **Overview** — the entry point to everything below.

**Non-negotiables carried across every phase**
- Zero hardcoded platform names — everything reads from `plugin_registry` / `plugin_installations`. Adding a plugin adds it everywhere.
- Every chart is a generic primitive (`<Line>`, `<Bar>`, `<Area>`, `<StackedArea>`, `<Pie>`, `<Donut>`, `<Treemap>`, `<Heatmap>`, `<Funnel>`, `<Radar>`, `<Gauge>`, `<Geo>`, `<KpiCard>`, `<Table>`) with hover, fullscreen, PNG + CSV export, dark/light.
- All KPI logic goes through the existing Unified Data Engine (`getMetrics`, `MetricSnapshot`) — never a provider SDK in a component.
- AI answers 4 questions in order (What happened / Why / What to do / Confidence). Structured JSON, Zod-validated, refuses on low data.

---

## Phase 1 — Analytics Center shell + Chart Library (this turn)

**Deliverables**
- Rename Analytics tab → **Analytics Center**. Left rail with all 16 sub-hubs; unbuilt ones show a "Coming in Phase N" empty state with the planned KPIs listed — no dead links.
- Move existing Executive Dashboard → **Overview** (`/analytics/overview`), no behavior change.
- Global `PlatformSelector` (already exists) + global `DateFilter` presets: Today, Yesterday, 7d, 30d, 90d, This Month, Last Month, Quarter, Year, Custom — persisted in URL search params so links/refreshes preserve state.
- **Chart library v1** in `src/features/analytics/charts/`: add Spline, Horizontal Bar, Stacked Bar, Treemap, Heatmap, Calendar Heatmap, Funnel, Radar, Gauge, Scatter, Bubble, Geo (world), Table, Pivot Table, Scorecard, Progress. Each: hover tooltip, fullscreen, PNG + CSV export, empty state, loading skeleton.
- **Analytics Modes** switcher (Unified / Platform / Comparison) — Unified and Platform wired; Comparison ships in Phase 2.

## Phase 2 — Platform, Campaign, Content, Audience, Ad, Revenue sub-hubs

Each sub-hub is a layout of chart primitives fed by KPI metadata from the plugin registry — no bespoke platform code. Comparison Mode goes live: pick 2–N slices (platform × platform, campaign × campaign, period × period, organic × paid) and every chart re-renders side-by-side.

Content Analytics gets the post-level table (thumbnail, caption, all metrics, sortable, virtualized).

## Phase 3 — Custom Dashboards + Report Builder

- Drag/resize/duplicate/share/pin/hide widgets, saved as `dashboards` + `dashboard_widgets` in DB. React Grid Layout under the hood.
- Report Builder: pick charts → date range → filters → branding → export **PDF, XLSX, CSV, PPTX** server-side.

## Phase 4 — AI Insights, Forecasting, Alerts, Developer Mode

- AI Insights hub with 4-question strategist across every KPI + auto-generated narratives on every chart ("Explain this").
- Forecasting: 30/60/90-day projections per KPI (Holt-Winters server-side).
- Alerts: threshold + anomaly rules, notifications via existing bell.
- Developer Analytics: per-chart drawer showing mapped API fields, raw JSON sample, formula, last sync, endpoint — reads existing `platform_endpoints` + `platform_kpi_mappings`.

## Phase 5 — SEO, Website, Competitor + Realtime

- SEO/Website read GA4 + Search Console via existing plugin contract.
- Competitor Analytics behind an "Add competitor" flow (manual URLs + optional Semrush connector).
- Realtime: Supabase channel on `metric_snapshots` → live KPI/chart updates + toast on threshold breach.

---

## Technical

- Routes: `src/routes/_authenticated/analytics.tsx` becomes a layout with a persistent left rail; children are `analytics.overview.tsx`, `analytics.platforms.tsx`, `analytics.campaigns.tsx`, … `analytics.developer.tsx`.
- URL state via `validateSearch` (zod) on the layout so filters persist across sub-hubs.
- Charts: keep Recharts for line/bar/area/pie; add `@nivo/heatmap`, `@nivo/treemap`, `@nivo/geo`, `@nivo/calendar`, `@nivo/radar` for the specialty charts (all support dark mode, SSR-safe with dynamic import).
- Data: all reads go through `getMetrics` from the Data Engine. Missing data → skeleton + "Connect a plugin" CTA, never fake numbers labeled as real.
- Custom dashboards: `react-grid-layout` + new tables `dashboards`, `dashboard_widgets` (Phase 3 migration).
- Exports: PNG via `html-to-image`, CSV inline, PDF via `pdf-lib`, XLSX via `xlsx`, PPTX via `pptxgenjs` (Phase 3).
- Realtime: `ALTER PUBLICATION supabase_realtime ADD TABLE metric_snapshots` (Phase 5).

---

## What I'm asking

Confirm **"go Phase 1"** and I'll ship the shell + chart library this turn. Or tell me which phase matters most and I'll reorder (e.g. many teams want Custom Dashboards + Report Builder before the specialty sub-hubs).
