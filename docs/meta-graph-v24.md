# Meta Graph / Marketing API v24.0 — Rothme Audit

**Upgraded:** October 2026 (from v21.0 → v24.0).
**Available until:** October 6, 2026 (v24.0 window per Meta changelog).

## What we upgraded

Bumped the Graph API version string in every Meta call site:

- `src/lib/social/adapters/facebook.ts` — `GRAPH`, `OAUTH` constants.
- `src/lib/social-connections/adapter.server.ts` — profile fetch.
- `src/lib/social-connections/platforms.ts` — Facebook + Instagram OAuth endpoints.
- `src/features/dev-integrations/PlatformPanel.tsx`, `src/features/dev-center/PlatformEditor.tsx` — placeholder text for admin configuration UI.

## v24.0 breaking-change audit (against Rothme surface)

| v24.0 change | Affects Rothme? | Notes |
|---|---|---|
| Advantage+ shopping / app campaigns deprecation | **No** | We don't create ads campaigns. Organic Page publishing only. |
| Messenger ads for leads deprecation | **No** | No `messenger_lead_forms` usage. |
| Ad set budget sharing (`is_adset_budget_sharing_enabled` required) | **No** | No adset creation. |
| Facebook video feeds ad placement deprecation | **No** | No placement targeting. |
| Detailed targeting interest consolidation | **No** | No targeting API usage. |
| Flagged custom audiences / conversions failing | **No** | No custom audiences or custom conversions. |
| Website destination optimization on `adcreatives` | **No** | No `adcreatives` calls. |
| Catalog batch payload limit 30 MB / `allow_upsert` on products | **No** | No product catalog usage. |
| Lookalike audience `lookalike_spec` type enforcement | **No** | No lookalikes. |

## Conclusion

Rothme's Meta surface is limited to Facebook Login for Business, Page publishing, Page/IG profile fetch, and read_insights. None of the v24.0 Marketing API deprecations affect our code paths. The version bump is a no-behavior-change upgrade.

## Next expiration

Plan next bump before **October 6, 2026** when v24.0 is retired.
