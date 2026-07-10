/**
 * Stub adapter — the shape every real adapter follows.
 *
 * Real adapters replace the `pull()` body with a gateway/API call and a
 * `map.ts` module that returns MetricSnapshot[]. The core app never changes.
 */
import type {
  AdapterCtx,
  ConnectResult,
  DateRange,
  HealthReport,
  MetricSnapshot,
  ProviderAdapter,
  ProviderCategory,
  ProviderId,
  AuthKind,
} from "./types";

export function defineStubAdapter(config: {
  id: ProviderId;
  name: string;
  category: ProviderCategory;
  authKind: AuthKind;
  blurb: string;
}): ProviderAdapter {
  return {
    id: config.id,
    name: config.name,
    category: config.category,
    authKind: config.authKind,
    blurb: config.blurb,

    async connect(_ctx: AdapterCtx): Promise<ConnectResult> {
      // v1: mocked — just mark connected. Real adapters return { kind: "redirect", url }.
      return { kind: "connected", connectionId: `stub-${config.id}` };
    },

    async refresh(_ctx: AdapterCtx): Promise<void> {
      // No-op for stubs. Real OAuth adapters refresh here.
    },

    async pull(_ctx: AdapterCtx, _range: DateRange): Promise<MetricSnapshot[]> {
      // Real adapters call the provider (preferably via connector gateway),
      // then map the response through ./map.ts into MetricSnapshot[].
      return [];
    },

    async health(_ctx: AdapterCtx): Promise<HealthReport> {
      return { status: "connected", lastSyncedAt: null, message: "Not yet syncing." };
    },

    async disconnect(_ctx: AdapterCtx): Promise<void> {
      // Real adapters revoke tokens and clear stored credential references.
    },
  };
}
