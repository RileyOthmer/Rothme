import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { logActivity } from "./activity-helper.server";
import type { Invite, Member } from "@/features/collab/types";

async function assertAdmin(supabase: any, orgId: string, userId: string) {
  const { data } = await supabase
    .from("org_memberships")
    .select("role")
    .eq("org_id", orgId)
    .eq("user_id", userId)
    .maybeSingle();
  if (!data || (data.role !== "owner" && data.role !== "admin")) {
    throw new Error("Only workspace admins can do this");
  }
  return data.role as "owner" | "admin";
}

export const listMembers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ orgId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }): Promise<Member[]> => {
    const { data: rows, error } = await context.supabase
      .from("org_memberships")
      .select("user_id, role, joined_at, profiles!inner(full_name, business_name)")
      .eq("org_id", data.orgId)
      .order("joined_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (rows ?? []).map((r: any) => ({
      user_id: r.user_id,
      role: r.role,
      joined_at: r.joined_at,
      full_name: r.profiles?.full_name ?? null,
      business_name: r.profiles?.business_name ?? null,
    }));
  });

export const listInvites = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ orgId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }): Promise<Invite[]> => {
    const { data: rows, error } = await context.supabase
      .from("org_invites")
      .select("id, email, role, created_at, expires_at, accepted_at, token")
      .eq("org_id", data.orgId)
      .is("accepted_at", null)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (rows ?? []) as Invite[];
  });

export const inviteMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        orgId: z.string().uuid(),
        email: z.string().email().max(200),
        role: z.enum(["admin", "member"]).default("member"),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, data.orgId, context.userId);

    const { data: org } = await context.supabase
      .from("organizations")
      .select("is_personal, name")
      .eq("id", data.orgId)
      .maybeSingle();
    if (!org) throw new Error("Workspace not found");
    if (org.is_personal) throw new Error("Personal workspaces cannot have members");

    const token = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
    const { data: inv, error } = await context.supabase
      .from("org_invites")
      .insert({
        org_id: data.orgId,
        email: data.email.toLowerCase().trim(),
        role: data.role,
        invited_by: context.userId,
        token,
      })
      .select("id, email, role, token, expires_at")
      .single();
    if (error) throw new Error(error.message);

    await logActivity(context.supabase, {
      orgId: data.orgId,
      actorId: context.userId,
      verb: "invited",
      summary: `Invited ${data.email} as ${data.role}.`,
    });

    return inv;
  });

export const revokeInvite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ orgId: z.string().uuid(), inviteId: z.string().uuid() }).parse(data),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, data.orgId, context.userId);
    const { error } = await context.supabase.from("org_invites").delete().eq("id", data.inviteId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const acceptInvite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ token: z.string().min(10) }).parse(data))
  .handler(async ({ data, context }) => {
    const { data: inv, error } = await context.supabase
      .from("org_invites")
      .select("id, org_id, role, expires_at, accepted_at, email")
      .eq("token", data.token)
      .maybeSingle();
    if (error || !inv) throw new Error("Invite not found");
    if (inv.accepted_at) throw new Error("Invite already used");
    if (new Date(inv.expires_at) < new Date()) throw new Error("Invite has expired");

    const { error: mErr } = await context.supabase.from("org_memberships").insert({
      org_id: inv.org_id,
      user_id: context.userId,
      role: inv.role,
      invited_by: null,
    });
    if (mErr && !String(mErr.message).includes("duplicate")) throw new Error(mErr.message);

    await context.supabase
      .from("org_invites")
      .update({ accepted_at: new Date().toISOString(), accepted_by: context.userId })
      .eq("id", inv.id);

    await context.supabase.from("profiles").update({ active_org_id: inv.org_id }).eq("id", context.userId);

    await logActivity(context.supabase, {
      orgId: inv.org_id,
      actorId: context.userId,
      verb: "joined",
      summary: `Joined the workspace.`,
    });

    return { orgId: inv.org_id };
  });

export const removeMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ orgId: z.string().uuid(), userId: z.string().uuid() }).parse(data),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, data.orgId, context.userId);
    const { data: target } = await context.supabase
      .from("org_memberships")
      .select("role")
      .eq("org_id", data.orgId)
      .eq("user_id", data.userId)
      .maybeSingle();
    if (target?.role === "owner") throw new Error("Cannot remove the workspace owner");

    const { error } = await context.supabase
      .from("org_memberships")
      .delete()
      .eq("org_id", data.orgId)
      .eq("user_id", data.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const updateMemberRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        orgId: z.string().uuid(),
        userId: z.string().uuid(),
        role: z.enum(["owner", "admin", "member"]),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const myRole = await assertAdmin(context.supabase, data.orgId, context.userId);

    if (data.role === "owner") {
      if (myRole !== "owner") throw new Error("Only the owner can transfer ownership");
      // demote current owner to admin then promote target
      await context.supabase
        .from("org_memberships")
        .update({ role: "admin" })
        .eq("org_id", data.orgId)
        .eq("user_id", context.userId);
    }

    const { error } = await context.supabase
      .from("org_memberships")
      .update({ role: data.role })
      .eq("org_id", data.orgId)
      .eq("user_id", data.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
