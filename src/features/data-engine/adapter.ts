/**
 * Adapter interface — the contract every platform integration MUST implement.
 *
 * Adapters are the ONLY code allowed to touch provider APIs. They fetch raw
 * data, normalize into `MetricSnapshot[]`, and return. They do not store,
 * do not call the AI, and do not know about the UI.
 *
 * Everything downstream (storage, query, AI, dashboard) reads the unified
 * shape — so the AI can never be tempted to reach around the engine.
 */

import type { Granularity, MetricSnapshot, ProviderId } from "./schema";

export type AdapterCredentials = {
  /** Encrypted, per-user, injected by the scheduler. Shape is adapter-defined. */
  [key: string]: unknown;
};

export type SyncWindow = {
  start: string; // ISO UTC
  end: string;   // ISO UTC
  granularity: Granularity;
};

export type SyncResult =
  | { ok: true; snapshots: MetricSnapshot[] }
  | { ok: false; error: AdapterError };

export type AdapterError =
  | { kind: "auth"; message: string }         // reconnect required
  | { kind: "rate_limit"; retryAfterMs: number }
  | { kind: "missing_scope"; scope: string }
  | { kind: "upstream"; status: number; message: string }
  | { kind: "unknown"; message: string };

/**
 * Every adapter is a plain object. No classes, no side effects at import
 * time. The scheduler is the only caller.
 */
export type Adapter = {
  id: ProviderId;
  /** True once this adapter can actually fetch real data. */
  available: boolean;
  /** Human-readable label for logs & error surfaces. */
  displayName: string;
  /**
   * Pull data for one user for one window and return normalized snapshots.
   * MUST NOT throw for expected failures — return `{ ok: false, error }`.
   * MAY throw only for programmer errors (e.g. invalid window).
   */
  fetchWindow(input: {
    credentials: AdapterCredentials;
    userId: string;
    window: SyncWindow;
  }): Promise<SyncResult>;
};

/**
 * Adapter registry — the ONLY place adapters are wired up.
 * Adding a new adapter: create `<id>.adapter.ts` alongside, then register
 * it here. UI, storage, scheduler, and AI all pick it up automatically.
 *
 * We keep the registry as a lazy factory to avoid importing provider SDKs
 * (which may be Node-only) until the scheduler actually runs.
 */
type AdapterFactory = () => Adapter;

const REGISTRY = new Map<ProviderId, AdapterFactory>();

export function registerAdapter(factory: AdapterFactory): void {
  const adapter = factory();
  REGISTRY.set(adapter.id, factory);
}

export function getAdapter(id: ProviderId): Adapter | undefined {
  const factory = REGISTRY.get(id);
  return factory ? factory() : undefined;
}

export function listRegisteredAdapters(): ProviderId[] {
  return [...REGISTRY.keys()];
}
