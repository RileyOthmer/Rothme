import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("profiles")
      .select("id, full_name, business_name, onboarded_at")
      .eq("id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    // In rare cases (e.g. trigger race), row may not exist; create it.
    if (!data) {
      const { data: inserted, error: insertErr } = await context.supabase
        .from("profiles")
        .insert({ id: context.userId })
        .select("id, full_name, business_name, onboarded_at")
        .single();
      if (insertErr) throw new Error(insertErr.message);
      return inserted;
    }
    return data;
  });

const updateProfileSchema = z.object({
  full_name: z.string().trim().min(1).max(100).optional(),
  business_name: z.string().trim().min(1).max(100).optional(),
  mark_onboarded: z.boolean().optional(),
});

export const updateProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => updateProfileSchema.parse(data))
  .handler(async ({ data, context }) => {
    const patch: Record<string, unknown> = {};
    if (data.full_name !== undefined) patch.full_name = data.full_name;
    if (data.business_name !== undefined) patch.business_name = data.business_name;
    if (data.mark_onboarded) patch.onboarded_at = new Date().toISOString();
    const { data: updated, error } = await context.supabase
      .from("profiles")
      .update(patch)
      .eq("id", context.userId)
      .select("id, full_name, business_name, onboarded_at")
      .single();
    if (error) throw new Error(error.message);
    return updated;
  });
