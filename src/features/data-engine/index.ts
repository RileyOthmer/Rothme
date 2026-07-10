/**
 * Public surface of the Unified Data Engine.
 *
 * Consumers (AI, dashboard, reports, notifications) import ONLY from here.
 * They must NEVER import from a provider adapter or a provider SDK.
 *
 *   ✅ import { getMetrics, METRIC_LABEL } from "@/features/data-engine";
 *   ❌ import { fetchShopifyOrders } from "shopify-api-node";
 *
 * The lint rule is social for now; the boundary is enforced by keeping
 * adapters in `./adapters/*` and never re-exporting them from here.
 */

export {
  MetricSnapshotSchema,
  METRIC_LABEL,
  PRIMITIVE_METRICS,
  DERIVED_METRICS,
  GRANULARITIES,
  PROVIDER_IDS,
  dimensionKey,
  parseDimensionKey,
} from "./schema";
export type {
  MetricSnapshot,
  PrimitiveMetric,
  DerivedMetric,
  Metric,
  Granularity,
  ProviderId,
} from "./schema";

export { derive, sumPrimitives } from "./derive";
export { getMetrics } from "./query.functions";
export type { MetricQueryResult } from "./query.functions";
export { ingestSnapshots } from "./ingest.functions";

// Adapter contract — exported so the scheduler and adapters can import it,
// but consumers of the engine (AI/UI) never reach for these.
export type { Adapter, AdapterCredentials, AdapterError, SyncResult, SyncWindow } from "./adapter";
export { registerAdapter, getAdapter, listRegisteredAdapters } from "./adapter";
