/**
 * Brand Assets — one record per org holding logo, colors, fonts, images,
 * and (optionally) brand guidelines. The AI reads these to keep generated
 * content on-brand. Files live in the private `brand-assets` storage
 * bucket; only DB row + signed download URLs are returned to the client.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type Ctx = { supabase: any; userId: string };

const BUCKET = "brand-assets";
const SIGNED_URL_TTL_SECONDS = 60 * 60; // 1 hour

async function activeOrgId(ctx: Ctx): Promise<string> {
  const { data } = await ctx.supabase
    .from("profiles")
    .select("active_org_id")
    .eq("id", ctx.userId)
    .maybeSingle();
  if (!data?.active_org_id) throw new Error("No active organization");
  return data.active_org_id as string;
}

async function signPath(
  ctx: Ctx,
  path: string | null | undefined,
): Promise<string | null> {
  if (!path) return null;
  const { data } = await ctx.supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);
  return data?.signedUrl ?? null;
}

export type BrandColor = { name: string; hex: string };
export type BrandFont = { name: string; role?: string | null };
export type BrandImage = { path: string; url: string | null };

export type BrandAssetsPayload = {
  orgId: string;
  logo: { path: string | null; url: string | null };
  guidelines: { path: string | null; url: string | null };
  images: BrandImage[];
  colors: BrandColor[];
  fonts: BrandFont[];
  notes: string | null;
  updatedAt: string | null;
};

/** Fetch (and lazily create) the brand assets row for the active org. */
export const getBrandAssets = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const orgId = await activeOrgId(context as Ctx);
    let { data, error } = await context.supabase
      .from("brand_assets")
      .select("*")
      .eq("org_id", orgId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) {
      const inserted = await context.supabase
        .from("brand_assets")
        .insert({ org_id: orgId })
        .select("*")
        .single();
      if (inserted.error) throw new Error(inserted.error.message);
      data = inserted.data;
    }

    const imagePaths: string[] = data.image_paths ?? [];
    const images: BrandImage[] = await Promise.all(
      imagePaths.map(async (p) => ({ path: p, url: await signPath(context as Ctx, p) })),
    );

    const payload: BrandAssetsPayload = {
      orgId,
      logo: { path: data.logo_path, url: await signPath(context as Ctx, data.logo_path) },
      guidelines: {
        path: data.guidelines_path,
        url: await signPath(context as Ctx, data.guidelines_path),
      },
      images,
      colors: (data.colors ?? []) as BrandColor[],
      fonts: (data.fonts ?? []) as BrandFont[],
      notes: data.notes,
      updatedAt: data.updated_at,
    };
    return payload;
  });

const colorSchema = z.object({
  name: z.string().max(60),
  hex: z
    .string()
    .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/, "Invalid hex"),
});
const fontSchema = z.object({
  name: z.string().min(1).max(80),
  role: z.string().max(60).nullable().optional(),
});

/**
 * Patch the brand assets record. Every field is optional — the client sends
 * only what changed. Passing `null` for logo_path / guidelines_path clears
 * that slot; omitting a field leaves it alone.
 */
export const saveBrandAssets = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        logo_path: z.string().nullable().optional(),
        guidelines_path: z.string().nullable().optional(),
        image_paths: z.array(z.string()).optional(),
        colors: z.array(colorSchema).optional(),
        fonts: z.array(fontSchema).optional(),
        notes: z.string().nullable().optional(),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    const orgId = await activeOrgId(context as Ctx);
    const patch: Record<string, unknown> = {};
    if (data.logo_path !== undefined) patch.logo_path = data.logo_path;
    if (data.guidelines_path !== undefined) patch.guidelines_path = data.guidelines_path;
    if (data.image_paths !== undefined) patch.image_paths = data.image_paths;
    if (data.colors !== undefined) patch.colors = data.colors;
    if (data.fonts !== undefined) patch.fonts = data.fonts;
    if (data.notes !== undefined) patch.notes = data.notes;

    // Upsert so a missing row is created on the first save.
    const { error } = await context.supabase
      .from("brand_assets")
      .upsert({ org_id: orgId, ...patch }, { onConflict: "org_id" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Delete a file from the brand-assets bucket (best-effort). */
export const removeBrandFile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ path: z.string().min(1) }).parse(d))
  .handler(async ({ context, data }) => {
    const orgId = await activeOrgId(context as Ctx);
    // Storage RLS also enforces this, but double-check the caller's org.
    if (!data.path.startsWith(`${orgId}/`)) {
      throw new Error("Path outside your organization");
    }
    const { error } = await context.supabase.storage.from(BUCKET).remove([data.path]);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
