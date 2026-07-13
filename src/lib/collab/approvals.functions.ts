import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { logActivity } from "./activity-helper.server";
import type { ApprovalRequest } from "@/features/collab/types";

async function mapApprovals(supabase: any, rows: any[]): Promise<ApprovalRequest[]> {
  if (rows.length === 0) return [];
  const ids = Array.from(new Set(rows.flatMap((r) => [r.requester_id, r.decided_by]).filter(Boolean)));
  const { data: profs } = await supabase.from("profiles").select("id, full_name").in("id", ids);
  const byId = new Map<string, string | null>((profs ?? []).map((p: any) => [p.id, p.full_name]));
  return rows.map((r) => ({
    id: r.id,
    org_id: r.org_id,
    requester_id: r.requester_id,
    requester_name: byId.get(r.requester_id) ?? null,
    title: r.title,
    rationale: r.rationale,
    subject_type: r.subject_type,
    subject_id: r.subject_id,
    status: r.status,
    decided_by: r.decided_by,
    decided_at: r.decided_at,
    decision_note: r.decision_note,
    created_at: r.created_at,
  }));
}

export const listApprovals = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ orgId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }): Promise<ApprovalRequest[]> => {
    const { data: rows, error } = await context.supabase
      .from("approval_requests")
      .select("*")
      .eq("org_id", data.orgId)
      .order("status", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return mapApprovals(context.supabase, rows ?? []);
  });

export const requestApproval = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        orgId: z.string().uuid(),
        title: z.string().trim().min(1).max(200),
        rationale: z.string().max(2000).optional(),
        subjectType: z.enum(["decision", "report", "goal", "dashboard"]).optional(),
        subjectId: z.string().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { data: a, error } = await context.supabase
      .from("approval_requests")
      .insert({
        org_id: data.orgId,
        requester_id: context.userId,
        title: data.title,
        rationale: data.rationale ?? null,
        subject_type: data.subjectType ?? null,
        subject_id: data.subjectId ?? null,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    await logActivity(context.supabase, {
      orgId: data.orgId,
      actorId: context.userId,
      verb: "requested_approval",
      summary: `Requested approval: ${data.title}`,
      subjectType: "approval",
      subjectId: a.id,
    });

    return { id: a.id };
  });

export const decideApproval = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        decision: z.enum(["approved", "rejected"]),
        note: z.string().max(1000).optional(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { data: a, error: readErr } = await context.supabase
      .from("approval_requests")
      .select("org_id, title, status")
      .eq("id", data.id)
      .single();
    if (readErr) throw new Error(readErr.message);
    if (a.status !== "pending") throw new Error("Already decided");

    // check admin
    const { data: mem } = await context.supabase
      .from("org_memberships")
      .select("role")
      .eq("org_id", a.org_id)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (!mem || (mem.role !== "owner" && mem.role !== "admin")) {
      throw new Error("Only admins can decide approvals");
    }

    const { error } = await context.supabase
      .from("approval_requests")
      .update({
        status: data.decision,
        decided_by: context.userId,
        decided_at: new Date().toISOString(),
        decision_note: data.note ?? null,
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);

    await logActivity(context.supabase, {
      orgId: a.org_id,
      actorId: context.userId,
      verb: data.decision,
      summary: `${data.decision === "approved" ? "Approved" : "Rejected"}: ${a.title}`,
      subjectType: "approval",
      subjectId: data.id,
    });

    return { ok: true };
  });
