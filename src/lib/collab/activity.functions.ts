import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { ActivityEvent } from "@/features/collab/types";

export const listActivity = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        orgId: z.string().uuid(),
        limit: z.number().int().min(1).max(200).default(50),
      })
      .parse(data),
  )
  .handler(async ({ data, context }): Promise<ActivityEvent[]> => {
    const { data: rows, error } = await context.supabase
      .from("activity_events")
      .select("id, actor_id, verb, subject_type, subject_id, summary, created_at")
      .eq("org_id", data.orgId)
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (error) throw new Error(error.message);

    const actorIds = Array.from(new Set((rows ?? []).map((r) => r.actor_id)));
    const { data: profs } = actorIds.length
      ? await context.supabase.from("profiles").select("id, full_name").in("id", actorIds)
      : { data: [] as any[] };
    const byId = new Map<string, string | null>((profs ?? []).map((p: any) => [p.id, p.full_name]));

    return (rows ?? []).map((r) => ({
      id: r.id,
      actor_id: r.actor_id,
      actor_name: byId.get(r.actor_id) ?? null,
      verb: r.verb,
      subject_type: r.subject_type,
      subject_id: r.subject_id,
      summary: r.summary,
      created_at: r.created_at,
    }));
  });
