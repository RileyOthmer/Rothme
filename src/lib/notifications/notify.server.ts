/**
 * Server-only helper for writing notifications.
 * Uses ON CONFLICT (user_id, dedupe_key) DO NOTHING to guarantee no duplicates.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

export type NotifyKind =
  | "connection.success"
  | "connection.failed"
  | "publish.success"
  | "publish.failed"
  | "analytics.synced"
  | "subscription.updated";

export type NotifySeverity = "info" | "opportunity" | "critical";

export async function notifyUser(
  supabase: SupabaseClient,
  params: {
    userId: string;
    kind: NotifyKind;
    title: string;
    body?: string;
    severity?: NotifySeverity;
    dedupeKey?: string;
    metadata?: Record<string, unknown>;
  },
): Promise<void> {
  try {
    // Insert only if dedupe_key is unused for this user. Ignore duplicates.
    await supabase
      .from("notifications")
      .upsert(
        {
          user_id: params.userId,
          kind: params.kind,
          title: params.title,
          body: params.body ?? null,
          severity: params.severity ?? "info",
          dedupe_key: params.dedupeKey ?? null,
          metadata: (params.metadata ?? {}) as never,
        },
        { onConflict: "user_id,dedupe_key", ignoreDuplicates: true },
      );
  } catch (err) {
    console.error("[notifyUser] failed", err);
  }
}
