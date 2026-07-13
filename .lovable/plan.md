# Velora Plugin Architecture — Build Plan

This is a large, foundational change. Shipping it all at once produces a shallow shell across 28 platforms. I want to build it in layers so each layer is real (works end-to-end for at least one plugin) before the next lands.

## The core principle

The core app never imports a platform. Everything platform-specific lives in a **plugin manifest** (database row) + **plugin runtime** (generic executor that reads the manifest). Adding Instagram = inserting rows. No code changes.

This is the same shape as the Universal Integration Engine you already approved — I'll extend that foundation instead of forking a parallel system.

## Phased delivery

### Phase 1 — Plugin Kernel (this turn)
The bones. Nothing platform-specific.

- `plugins` table: name, slug, version, developer, description, status (installed/enabled/disabled), health_score, api_version, permissions[], declared_modules[], manifest jsonb
- `plugin_installations` table: per-org install state, config, secrets (encrypted), enabled flags
- `plugin_health` table: rolling online/offline, latency, last_sync, last_error
- `plugin_events` table: install/enable/disable/error audit
- Generic executor `runPluginAction(plugin, module, action, input)` that dispatches based on manifest (auth type, endpoint, mapping) — reuses the endpoint + KPI-mapper engine already built
- Permission registry: plugin declares scopes, core enforces them
- **Plugin Manager UI** at `/settings/plugins`: list, status badges, health %, Install/Enable/Disable/Delete/Configure/Verify/Test buttons wired to the executor
- **Marketplace tab** (same page): Installed / Available / Updates — reads from `plugin_registry` seed rows

### Phase 2 — First real plugin end-to-end
Prove the kernel by installing **one** plugin (Instagram) with all 11 modules (Auth, Publishing, Analytics, Messaging, Comments, Media, Webhook, Scheduler, Settings, Error, Health) declared in manifest — no core changes needed. Verify KPIs flow to AI Engine automatically via the existing KPI mapper.

### Phase 3 — AI auto-registration
When a plugin enables, its mapped KPIs auto-register with the AI Engine's context (already partially wired via `platform_kpi_mappings`). Extend so AI queries can enumerate available KPIs per org without hardcoded platform list.

### Phase 4 — Remaining 27 plugin manifests
Seed rows only — no code. Each becomes installable from the Marketplace tab. Tester + Health work for all of them via the generic executor.

### Phase 5 — Advanced (only if requested)
- Hot-reload without redeploy (already true for manifests; UI polish)
- Version history / rollback
- Compatibility matrix
- External plugin submission flow

## What Phase 1 delivers today

- Migration: `plugins`, `plugin_installations`, `plugin_health`, `plugin_events`, `plugin_registry` with GRANTs + RLS + admin-only policies via `has_role`
- Server functions: `listPlugins`, `installPlugin`, `enablePlugin`, `disablePlugin`, `deletePlugin`, `configurePlugin`, `verifyPlugin`, `testPluginModule`, `getPluginHealth`
- Route: `/settings/plugins` (admin-gated) with Manager + Marketplace tabs, plugin cards, config drawer, tester panel, health panel
- Seed: registry rows for all 28 platforms with declared modules + permissions (manifest bodies empty until Phase 2 fills Instagram)
- Zero platform-specific code in `src/` — the core stays clean

## Technical notes (for reference)

- Extends existing `platform_integrations` + `platform_kpi_mappings` — plugins are the new outer envelope, integrations become the "installed instance" of a plugin per org
- Reuses `INTEGRATION_ENCRYPTION_KEY` for plugin secret storage
- All plugin actions go through one executor → uniform logging, retry, rate-limit, health tracking
- Marketplace is a DB table, not an external service — you own the catalog

## Confirm before I build

Reply **"go"** to build Phase 1 as scoped above.
Reply with edits if you want to change scope (e.g. "skip marketplace tab", "start with Facebook not Instagram", "combine phases 1+2").
