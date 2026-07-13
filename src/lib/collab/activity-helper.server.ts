import type { SupabaseClient } from "@supabase/supabase-js";

export async function logActivity(
  supabase: SupabaseClient,
  params: {
    orgId: string;
    actorId: string;
    verb: string;
    summary: string;
    subjectType?: string | null;
    subjectId?: string | null;
    metadata?: Record<string, unknown>;
  },
): Promise<void> {
  try {
    await supabase.from("activity_events").insert({
      org_id: params.orgId,
      actor_id: params.actorId,
      verb: params.verb,
      summary: params.summary,
      subject_type: params.subjectType ?? null,
      subject_id: params.subjectId ?? null,
      metadata: params.metadata ?? {},
    });
  } catch (err) {
    console.error("[activity] failed to log", err);
  }
}
