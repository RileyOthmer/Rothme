# Social Integration Framework

Plugin-based framework that lets Velora talk to any social platform through a
single interface. Core app depends only on `types.ts` and `framework.server.ts`
— never on platform-specific code.

## Files

- `types.ts` — `SocialAdapter` contract + shared types (client-safe).
- `registry.ts` — adapter registry; `bootstrapSocialAdapters()` wires all.
- `adapters/stub.ts` — reference implementation; copy for real platforms.
- `framework.server.ts` — server-only services:
  - `IntegrationManager` (facade)
  - `OAuthConnectionManager`
  - `TokenManager` (refresh + expiry)
  - `createApiClient` (retries, timeouts, 429/401 handling)
  - `RateLimiter` (token bucket)
  - `WebhookManager` (HMAC verify + subscribe)
  - `BackgroundSyncService` (analytics + comments sweep)
  - `AnalyticsMapper` (adapter output → unified snapshots)
  - `PublishingService` (single + fan-out publish)
  - `MediaUploadService`
  - `Logger` + `classifyError` (structured logs + typed error taxonomy)

## Adding a platform

1. `src/lib/social/adapters/<id>.ts` — export a `SocialAdapter`.
2. Add a line to `bootstrapSocialAdapters()` in `registry.ts`.
3. Done. OAuth, sync, publish, and analytics pick it up automatically.

## Storage

Framework depends on the `SocialStore` interface — supply a Supabase-backed
implementation where you construct `IntegrationManager`. The framework never
imports Supabase directly.
