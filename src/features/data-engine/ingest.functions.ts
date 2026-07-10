/**
 * Unified Data Engine — ingest.
 *
 * The ONLY writer into `metric_snapshots`. Adapters return snapshots; this
 * function validates them and upserts. Every other path (dashboard, AI,
 * reports) is read-only.
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { MetricSnapshotSchema, type MetricSnapshot } from "./schema";

const IngestInput = z.object({
  snapshots: z.array(MetricSnapshotSchema).max(5000),
});

/**
 * Write a batch of adapter-produced snapshots. Upserts on the unique key so
 * re-runs of the same window are idempotent.
 *
 * Called by the scheduler (per-user, per-provider). Never called from the UI.
 */
export const ingestSnapshots = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => IngestInput.parse(data))
  .handler(async ({ data, context }) => {
    const rows = data.snapshots.map((s: MetricSnapshot) => ({
      user_id: context.userId,
      provider: s.provider,
      metric: s.metric,
      value: s.value,
      currency: s.currency,
      period_start: s.period_start,
      granularity: s.granularity,
      dimension_key: s.dimension_key,
      dimensions: s.dimensions,
      confidence: s.confidence,
      captured_at: s.captured_at,
    }));

    if (rows.length === 0) return { written: 0 };

    const { error, count } = await context.supabase
      .from("metric_snapshots")
      .upsert(rows, {
        onConflict: "user_id,provider,metric,dimension_key,period_start,granularity",
        count: "exact",
      });

    if (error) throw new Error(`ingest failed: ${error.message}`);
    return { written: count ?? rows.length };
  });
