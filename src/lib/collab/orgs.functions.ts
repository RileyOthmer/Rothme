import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Organization } from "@/features/collab/types";

export const listMyOrgs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Organization[]> => {
    const { data, error } = await context.supabase
      .from("org_memberships")
      .select("role, organizations!inner(id, name, slug, is_personal, created_at)")
      .eq("user_id", context.userId)
      .order("joined_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []).map((row: any) => ({
      id: row.organizations.id,
      name: row.organizations.name,
      slug: row.organizations.slug,
      is_personal: row.organizations.is_personal,
      created_at: row.organizations.created_at,
      role: row.role,
    }));
  });

export const getActiveOrg = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Organization | null> => {
    const { data: profile } = await context.supabase
      .from("profiles")
      .select("active_org_id")
      .eq("id", context.userId)
      .maybeSingle();

    let orgId = profile?.active_org_id as string | null | undefined;

    if (!orgId) {
      const { data: first } = await context.supabase
        .from("org_memberships")
        .select("org_id")
        .eq("user_id", context.userId)
        .order("joined_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      orgId = first?.org_id ?? null;
      if (orgId) {
        await context.supabase.from("profiles").update({ active_org_id: orgId }).eq("id", context.userId);
      }
    }

    if (!orgId) return null;

    const { data: org } = await context.supabase
      .from("organizations")
      .select("id, name, slug, is_personal, created_at")
      .eq("id", orgId)
      .maybeSingle();
    if (!org) return null;

    const { data: membership } = await context.supabase
      .from("org_memberships")
      .select("role")
      .eq("org_id", orgId)
      .eq("user_id", context.userId)
      .maybeSingle();

    return {
      ...org,
      role: (membership?.role ?? "member") as Organization["role"],
    };
  });

export const setActiveOrg = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ orgId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { data: member } = await context.supabase
      .from("org_memberships")
      .select("org_id")
      .eq("org_id", data.orgId)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (!member) throw new Error("You are not a member of that workspace");
    await context.supabase.from("profiles").update({ active_org_id: data.orgId }).eq("id", context.userId);
    return { ok: true };
  });

export const createOrg = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ name: z.string().trim().min(1).max(80) }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const slug =
      data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 40) +
      "-" +
      Math.random().toString(36).slice(2, 8);

    const { data: org, error } = await context.supabase
      .from("organizations")
      .insert({
        name: data.name,
        slug,
        is_personal: false,
        created_by: context.userId,
      })
      .select("id, name, slug, is_personal, created_at")
      .single();
    if (error) throw new Error(error.message);

    const { error: mErr } = await context.supabase.from("org_memberships").insert({
      org_id: org.id,
      user_id: context.userId,
      role: "owner",
    });
    if (mErr) throw new Error(mErr.message);

    await context.supabase.from("profiles").update({ active_org_id: org.id }).eq("id", context.userId);

    await context.supabase.from("activity_events").insert({
      org_id: org.id,
      actor_id: context.userId,
      verb: "created_org",
      summary: `Created the ${org.name} workspace.`,
    });

    return org;
  });

export const renameOrg = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ orgId: z.string().uuid(), name: z.string().trim().min(1).max(80) }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("organizations")
      .update({ name: data.name })
      .eq("id", data.orgId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
