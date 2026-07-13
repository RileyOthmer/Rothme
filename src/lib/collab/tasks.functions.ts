import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { logActivity } from "./activity-helper.server";
import type { Task } from "@/features/collab/types";

async function mapTasks(supabase: any, rows: any[]): Promise<Task[]> {
  if (rows.length === 0) return [];
  const ids = Array.from(new Set(rows.flatMap((r) => [r.assignee_id, r.assigner_id]).filter(Boolean)));
  const { data: profs } = await supabase.from("profiles").select("id, full_name").in("id", ids);
  const byId = new Map<string, string | null>((profs ?? []).map((p: any) => [p.id, p.full_name]));
  return rows.map((r) => ({
    id: r.id,
    org_id: r.org_id,
    title: r.title,
    description: r.description,
    assignee_id: r.assignee_id,
    assignee_name: r.assignee_id ? byId.get(r.assignee_id) ?? null : null,
    assigner_id: r.assigner_id,
    assigner_name: byId.get(r.assigner_id) ?? null,
    subject_type: r.subject_type,
    subject_id: r.subject_id,
    due_date: r.due_date,
    status: r.status,
    created_at: r.created_at,
  }));
}

export const listOrgTasks = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ orgId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }): Promise<Task[]> => {
    const { data: rows, error } = await context.supabase
      .from("tasks")
      .select("*")
      .eq("org_id", data.orgId)
      .order("status", { ascending: true })
      .order("due_date", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return mapTasks(context.supabase, rows ?? []);
  });

export const listMyTasks = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: assignedToMe } = await context.supabase
      .from("tasks")
      .select("*")
      .eq("assignee_id", context.userId)
      .order("status", { ascending: true })
      .order("due_date", { ascending: true, nullsFirst: false });
    const { data: assignedByMe } = await context.supabase
      .from("tasks")
      .select("*")
      .eq("assigner_id", context.userId)
      .neq("assignee_id", context.userId)
      .order("status", { ascending: true });
    return {
      assignedToMe: await mapTasks(context.supabase, assignedToMe ?? []),
      assignedByMe: await mapTasks(context.supabase, assignedByMe ?? []),
    };
  });

export const createTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        orgId: z.string().uuid(),
        title: z.string().trim().min(1).max(200),
        description: z.string().max(2000).optional(),
        assigneeId: z.string().uuid().optional(),
        subjectType: z.enum(["decision", "report", "goal", "dashboard"]).optional(),
        subjectId: z.string().optional(),
        dueDate: z.string().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { data: t, error } = await context.supabase
      .from("tasks")
      .insert({
        org_id: data.orgId,
        title: data.title,
        description: data.description ?? null,
        assignee_id: data.assigneeId ?? context.userId,
        assigner_id: context.userId,
        subject_type: data.subjectType ?? null,
        subject_id: data.subjectId ?? null,
        due_date: data.dueDate ?? null,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    await logActivity(context.supabase, {
      orgId: data.orgId,
      actorId: context.userId,
      verb: "assigned",
      summary: `Assigned task: ${data.title}`,
      subjectType: "task",
      subjectId: t.id,
    });

    return { id: t.id };
  });

export const updateTaskStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["open", "done", "cancelled"]),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { data: t, error } = await context.supabase
      .from("tasks")
      .update({ status: data.status })
      .eq("id", data.id)
      .select("org_id, title")
      .single();
    if (error) throw new Error(error.message);

    if (data.status === "done") {
      await logActivity(context.supabase, {
        orgId: t.org_id,
        actorId: context.userId,
        verb: "completed_task",
        summary: `Completed task: ${t.title}`,
        subjectType: "task",
        subjectId: data.id,
      });
    }
    return { ok: true };
  });
