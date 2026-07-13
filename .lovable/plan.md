# Velora — Remaining Modules Build Plan

You asked for everything. That's ~10 major modules on top of what's already shipped (Auth, Orgs, Teams, Billing, Plugin System, Analytics Center Phase 1). Building it all in one turn would produce shallow, broken surfaces. Instead I'll ship it in tight phases — each phase is production-quality, plugin-architected, and independently usable.

## What's already built
Auth · Organizations · Teams · Billing · Dashboard · AI Engine · Notifications · Plugin Registry & Installer · Analytics Center shell (16 hubs, Overview live)

## Phases (I'll build one per turn unless you say otherwise)

### Phase A — Publishing + Composer + Calendar
- `plugins.publishing` core: post model, media library, drafts, approvals
- Universal Composer (text, media, per-platform variants, AI rewrite, hashtags, mentions, link shortener, previews)
- Calendar (month/week/day, drag-to-reschedule, queue slots, best-time AI)
- Scheduler engine (server fn + cron via `/api/public/cron/publish`)
- Tables: `posts`, `post_variants`, `post_schedules`, `media_assets`, `approval_flows`

### Phase B — Unified Inbox + Engagement
- Cross-platform inbox (DMs, comments, mentions, reviews)
- Conversation view, assign, tag, snooze, SLA timers
- AI reply drafts, sentiment, intent classification
- Saved replies, macros, team collision detection
- Tables: `inbox_threads`, `inbox_messages`, `inbox_assignments`, `saved_replies`

### Phase C — CRM (Contacts + Companies + Deals)
- Contacts, companies, deals, pipelines, activities, notes
- Segments (dynamic filters), lists, imports (CSV)
- Timeline view (all touchpoints across plugins)
- Lead scoring (AI) + lifecycle stages
- Tables: `contacts`, `companies`, `deals`, `pipelines`, `deal_stages`, `activities`, `segments`

### Phase D — Email Marketing
- Drag-drop email builder (blocks: text, image, button, columns, product)
- Templates, brand kit, personalization tokens
- Campaigns (one-off + automated), A/B tests
- Deliverability dashboard, suppression list
- Sending via Resend connector; tracking via public webhook
- Tables: `email_templates`, `email_campaigns`, `email_sends`, `email_events`, `suppressions`

### Phase E — Campaign Management
- Multi-channel campaigns (social + email + ads unified)
- Campaign brief → AI generates plan → schedules across plugins
- Budget tracking, UTM manager, goal tracking
- Attribution (first/last/linear/AI)
- Tables: `campaigns`, `campaign_channels`, `campaign_goals`, `attribution_touches`

### Phase F — Automation (Workflow Builder)
- Visual node editor (trigger → conditions → actions)
- Triggers: new contact, form submit, tag added, KPI threshold, schedule
- Actions: send email, post content, add to segment, notify, AI task, webhook
- Delays, branches, wait-until, A/B splits
- Tables: `workflows`, `workflow_nodes`, `workflow_runs`, `workflow_run_steps`

### Phase G — Reports
- Report builder (drag KPIs → chart → dashboard → schedule)
- Templates: Weekly, Monthly, Campaign, Client, Executive
- PDF/PPTX/XLSX export (server-side)
- Scheduled email delivery
- White-label for agencies (logo, colors, domain)
- Tables: `reports`, `report_widgets`, `report_schedules`, `report_deliveries`

### Phase H — Marketplace
- Public plugin marketplace UI (browse, search, categories, ratings)
- Plugin detail pages (screenshots, changelog, pricing, permissions)
- Install/uninstall flow with permission consent
- Developer submission flow → review queue
- Tables: `marketplace_listings`, `marketplace_reviews`, `marketplace_installs`, `marketplace_submissions`

### Phase I — Developer Center
- API keys management (scoped, rotatable)
- Webhooks (subscribe to events, delivery logs, retries)
- Plugin SDK docs + starter templates
- OAuth app registration
- Sandbox playground
- Tables: `api_keys`, `webhooks`, `webhook_deliveries`, `oauth_apps`

### Phase J — Enterprise Administration
- SSO/SAML config UI (per org)
- SCIM provisioning endpoint
- Audit log viewer (already have `activity_events`)
- Data residency + retention policies
- Compliance exports (GDPR, SOC2 evidence)
- Role & permission matrix editor
- IP allowlist, session policies

## Cross-cutting rules for every phase
- **Plugin-first**: each module registered via `plugin_registry` — core never imports plugin-specific code
- **RLS**: every table scoped to `org_id` with `has_org_role` policies
- **AI**: every module exposes KPIs to AI Engine via a standard `describeMetrics()` contract
- **Realtime**: inbox, workflow runs, and approvals subscribe via Supabase Realtime
- **Performance**: virtualized tables (react-virtual), lazy routes, server-side pagination, TanStack Query with proper cache keys
- **UI**: glassmorphism design system already established; premium, accessible, responsive
- **Server functions** (not edge functions) for all app-internal logic; `/api/public/*` only for webhooks/cron

## What I need from you
**Which phase do I start with?** My recommendation: **Phase A (Publishing)** — it's the highest-leverage feature, most social-media platforms already installed, and unlocks Inbox (B) and Campaigns (E). If you truly want "just start and keep going", I'll build A now and continue with B on your next message.

Reply with a phase letter (A–J) or "start with A and keep going".