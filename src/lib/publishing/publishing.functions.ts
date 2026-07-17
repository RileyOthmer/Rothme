// Publishing plugin: server functions for posts, variants, schedules, media.
// Core UI never touches provider APIs directly — the scheduler dispatches to plugins.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type Ctx = { supabase: any; userId: string };

async function activeOrgId(ctx: Ctx): Promise<string> {
  const { data } = await ctx.supabase
    .from("profiles")
    .select("active_org_id")
    .eq("id", ctx.userId)
    .maybeSingle();
  if (!data?.active_org_id) throw new Error("No active organization");
  return data.active_org_id as string;
}

// ---------- Media ----------------------------------------------------------

export const listMedia = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const orgId = await activeOrgId(context as Ctx);
    const { data, error } = await context.supabase
      .from("media_assets")
      .select("*")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const createMedia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        kind: z.enum(["image", "video", "gif", "document"]),
        url: z.string().url(),
        thumbnail_url: z.string().url().optional(),
        filename: z.string().optional(),
        mime_type: z.string().optional(),
        size_bytes: z.number().int().nonnegative().optional(),
        width: z.number().int().nonnegative().optional(),
        height: z.number().int().nonnegative().optional(),
        alt_text: z.string().optional(),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    const orgId = await activeOrgId(context as Ctx);
    const { data: row, error } = await context.supabase
      .from("media_assets")
      .insert({ ...data, org_id: orgId, created_by: context.userId })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const deleteMedia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.from("media_assets").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Posts ----------------------------------------------------------

const variantSchema = z.object({
  platform_id: z.string(),
  body: z.string().default(""),
  media_ids: z.array(z.string().uuid()).default([]),
  platform_meta: z.record(z.string(), z.any()).default({}),
});
const scheduleSchema = z.object({
  platform_id: z.string(),
  scheduled_at: z.string().datetime(),
});

export const listPosts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        status: z.array(z.string()).optional(),
        from: z.string().datetime().optional(),
        to: z.string().datetime().optional(),
        limit: z.number().int().min(1).max(500).default(200),
      })
      .parse(d ?? {}),
  )
  .handler(async ({ context, data }) => {
    const orgId = await activeOrgId(context as Ctx);
    let q = context.supabase
      .from("posts")
      .select("*, post_variants(*), post_schedules(*)")
      .eq("org_id", orgId)
      .order("updated_at", { ascending: false })
      .limit(data.limit);
    if (data.status?.length) q = q.in("status", data.status);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const getPost = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const { data: row, error } = await context.supabase
      .from("posts")
      .select("*, post_variants(*), post_schedules(*)")
      .eq("id", data.id)
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const savePost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid().optional(),
        title: z.string().nullish(),
        body: z.string().default(""),
        status: z
          .enum(["draft", "scheduled", "publishing", "published", "failed", "archived"])
          .default("draft"),
        tags: z.array(z.string()).default([]),
        variants: z.array(variantSchema).default([]),
        schedules: z.array(scheduleSchema).default([]),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    const orgId = await activeOrgId(context as Ctx);
    let postId = data.id;

    if (!postId) {
      const { data: created, error } = await context.supabase
        .from("posts")
        .insert({
          org_id: orgId,
          created_by: context.userId,
          title: data.title ?? null,
          body: data.body,
          status: data.status,
          tags: data.tags,
        })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      postId = created.id;
    } else {
      const { error } = await context.supabase
        .from("posts")
        .update({
          title: data.title ?? null,
          body: data.body,
          status: data.status,
          tags: data.tags,
        })
        .eq("id", postId);
      if (error) throw new Error(error.message);
    }

    // Replace variants
    await context.supabase.from("post_variants").delete().eq("post_id", postId);
    if (data.variants.length) {
      const { error } = await context.supabase
        .from("post_variants")
        .insert(data.variants.map((v) => ({ ...v, post_id: postId })));
      if (error) throw new Error(error.message);
    }

    // Replace schedules (only future/pending — keep published records)
    await context.supabase
      .from("post_schedules")
      .delete()
      .eq("post_id", postId)
      .in("status", ["pending", "cancelled"]);
    if (data.schedules.length) {
      const { error } = await context.supabase.from("post_schedules").insert(
        data.schedules.map((s) => ({
          post_id: postId,
          platform_id: s.platform_id,
          scheduled_at: s.scheduled_at,
          status: "pending" as const,
        })),
      );
      if (error) throw new Error(error.message);
    }

    return { id: postId };
  });

export const deletePost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.from("posts").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Update a post's status. Use for archive / restore flows. */
export const setPostStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum([
          "draft",
          "scheduled",
          "publishing",
          "published",
          "failed",
          "archived",
        ]),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase
      .from("posts")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/**
 * Duplicate an existing post (with its variants) as a fresh draft.
 * Schedules are intentionally not copied — a duplicate should never
 * accidentally re-publish anywhere.
 */
export const duplicatePost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const orgId = await activeOrgId(context as Ctx);

    const { data: src, error: readErr } = await context.supabase
      .from("posts")
      .select("*, post_variants(*)")
      .eq("id", data.id)
      .eq("org_id", orgId)
      .single();
    if (readErr) throw new Error(readErr.message);
    if (!src) throw new Error("Post not found");

    const copiedTitle = src.title ? `${src.title} (copy)` : "Untitled (copy)";
    const { data: created, error: insErr } = await context.supabase
      .from("posts")
      .insert({
        org_id: orgId,
        created_by: context.userId,
        title: copiedTitle,
        body: src.body ?? "",
        status: "draft",
        tags: src.tags ?? [],
      })
      .select("id")
      .single();
    if (insErr) throw new Error(insErr.message);

    const variants = (src.post_variants ?? []) as Array<{
      platform_id: string;
      body: string | null;
      media_ids: string[] | null;
      platform_meta: Record<string, unknown> | null;
    }>;
    type Json = string | number | boolean | null | { [k: string]: Json } | Json[];
    if (variants.length) {
      const { error: vErr } = await context.supabase.from("post_variants").insert(
        variants.map((v) => ({
          post_id: created.id,
          platform_id: v.platform_id,
          body: v.body ?? "",
          media_ids: v.media_ids ?? [],
          platform_meta: v.platform_meta ?? {},
        })),
      );
      if (vErr) throw new Error(vErr.message);
    }

    return { id: created.id as string };
  });


export const rescheduleItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({ id: z.string().uuid(), scheduled_at: z.string().datetime() })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase
      .from("post_schedules")
      .update({ scheduled_at: data.scheduled_at })
      .eq("id", data.id)
      .eq("status", "pending");
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const cancelSchedule = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase
      .from("post_schedules")
      .update({ status: "cancelled" })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Platforms (installed publishing targets) -----------------------

export const listPublishTargets = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const orgId = await activeOrgId(context as Ctx);
    const { data: installs } = await context.supabase
      .from("plugin_installations")
      .select("plugin_slug, status, enabled_modules")
      .eq("org_id", orgId)
      .in("status", ["installed", "enabled"]);
    const { data: registry } = await context.supabase
      .from("plugin_registry")
      .select("slug, name, category, icon");
    const byslug = new Map((registry ?? []).map((r: any) => [r.slug, r]));
    return (installs ?? [])
      .map((i: any) => ({
        platform_id: i.plugin_slug,
        name: byslug.get(i.plugin_slug)?.name ?? i.plugin_slug,
        icon: byslug.get(i.plugin_slug)?.icon ?? null,
        category: byslug.get(i.plugin_slug)?.category ?? null,
      }))
      .filter((p) => p.category === "social" || p.category === "publishing" || p.category === null);
  });
