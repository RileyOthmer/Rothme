import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { logActivity } from "./activity-helper.server";
import type { Comment } from "@/features/collab/types";

const SUBJECT_TYPES = ["decision", "report", "goal", "dashboard", "task", "approval"] as const;

export const listComments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        orgId: z.string().uuid(),
        subjectType: z.enum(SUBJECT_TYPES),
        subjectId: z.string().min(1),
      })
      .parse(data),
  )
  .handler(async ({ data, context }): Promise<Comment[]> => {
    const { data: rows, error } = await context.supabase
      .from("comments")
      .select("id, org_id, subject_type, subject_id, author_id, body, created_at, profiles!inner(full_name)")
      .eq("org_id", data.orgId)
      .eq("subject_type", data.subjectType)
      .eq("subject_id", data.subjectId)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (rows ?? []).map((r: any) => ({
      id: r.id,
      org_id: r.org_id,
      subject_type: r.subject_type,
      subject_id: r.subject_id,
      author_id: r.author_id,
      author_name: r.profiles?.full_name ?? null,
      body: r.body,
      created_at: r.created_at,
    }));
  });

export const postComment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        orgId: z.string().uuid(),
        subjectType: z.enum(SUBJECT_TYPES),
        subjectId: z.string().min(1),
        body: z.string().trim().min(1).max(4000),
        mentionUserIds: z.array(z.string().uuid()).max(20).default([]),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { data: c, error } = await context.supabase
      .from("comments")
      .insert({
        org_id: data.orgId,
        subject_type: data.subjectType,
        subject_id: data.subjectId,
        author_id: context.userId,
        body: data.body,
      })
      .select("id, created_at")
      .single();
    if (error) throw new Error(error.message);

    if (data.mentionUserIds.length > 0) {
      await context.supabase.from("mentions").insert(
        data.mentionUserIds.map((uid) => ({
          comment_id: c.id,
          mentioned_user_id: uid,
          org_id: data.orgId,
        })),
      );
    }

    await logActivity(context.supabase, {
      orgId: data.orgId,
      actorId: context.userId,
      verb: "commented",
      summary: `Commented on ${data.subjectType}.`,
      subjectType: data.subjectType,
      subjectId: data.subjectId,
    });

    return { id: c.id };
  });

export const deleteComment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("comments").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
