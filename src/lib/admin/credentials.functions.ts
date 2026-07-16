/**
 * Admin credential management server functions.
 * All handlers require admin role — re-verified server-side.
 */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { PLATFORMS, type PlatformId } from "@/lib/social-connections/platforms";

async function assertAdmin(userId: string): Promise<void> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("id")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error || !data) throw new Error("Forbidden");
}

export type CredentialStatus = {
  platformId: PlatformId;
  name: string;
  category: string;
  brandColor: string;
  mark: string;
  configured: boolean;
  source: "db" | "env" | "none";
  clientIdLast4: string | null;
  clientSecretLast4: string | null;
  updatedAt: string | null;
  docsUrl: string;
  clientIdEnv: string;
  clientSecretEnv: string;
};

export const listAdminCredentials = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<CredentialStatus[]> => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows } = await supabaseAdmin
      .from("admin_credentials")
      .select("platform_id, client_id_last4, client_secret_last4, client_id_ciphertext, client_secret_ciphertext, updated_at");

    type Row = {
      platform_id: string;
      client_id_last4: string | null;
      client_secret_last4: string | null;
      client_id_ciphertext: string | null;
      client_secret_ciphertext: string | null;
      updated_at: string;
    };
    const byPlatform = new Map<string, Row>();
    for (const r of ((rows ?? []) as unknown as Row[])) byPlatform.set(r.platform_id, r);

    return PLATFORMS.map((p): CredentialStatus => {
      const row = byPlatform.get(p.id);
      const dbConfigured = Boolean(row?.client_id_ciphertext && row?.client_secret_ciphertext);
      const envConfigured = Boolean(process.env[p.clientIdEnv] && process.env[p.clientSecretEnv]);
      const source: "db" | "env" | "none" = dbConfigured ? "db" : envConfigured ? "env" : "none";
      return {
        platformId: p.id,
        name: p.name,
        category: p.category,
        brandColor: p.brandColor,
        mark: p.mark,
        configured: dbConfigured || envConfigured,
        source,
        clientIdLast4: row?.client_id_last4 ?? null,
        clientSecretLast4: row?.client_secret_last4 ?? null,
        updatedAt: row?.updated_at ?? null,
        docsUrl: p.docsUrl,
        clientIdEnv: p.clientIdEnv,
        clientSecretEnv: p.clientSecretEnv,
      };
    });
  });

export const upsertAdminCredential = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { platformId: PlatformId; clientId?: string; clientSecret?: string; notes?: string }) => data)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { encryptJson } = await import("@/lib/integrations/crypto.server");
    const { invalidateCredentialCache } = await import("./credential-resolver.server");

    const patch: Record<string, unknown> = {
      platform_id: data.platformId,
      updated_by: context.userId,
      updated_at: new Date().toISOString(),
    };
    if (data.clientId !== undefined && data.clientId !== "") {
      patch.client_id_ciphertext = encryptJson({ v: data.clientId });
      patch.client_id_last4 = data.clientId.slice(-4);
    }
    if (data.clientSecret !== undefined && data.clientSecret !== "") {
      patch.client_secret_ciphertext = encryptJson({ v: data.clientSecret });
      patch.client_secret_last4 = data.clientSecret.slice(-4);
    }
    if (data.notes !== undefined) patch.notes = data.notes;

    const { error } = await supabaseAdmin
      .from("admin_credentials")
      .upsert(patch as never, { onConflict: "platform_id" });
    if (error) throw new Error(error.message);
    invalidateCredentialCache(data.platformId);
    return { ok: true };
  });

export const deleteAdminCredential = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { platformId: PlatformId }) => data)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { invalidateCredentialCache } = await import("./credential-resolver.server");
    await supabaseAdmin.from("admin_credentials").delete().eq("platform_id", data.platformId);
    invalidateCredentialCache(data.platformId);
    return { ok: true };
  });

const INFRA_SECRETS = [
  "INTEGRATION_ENCRYPTION_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_PRICE_MONTHLY",
  "STRIPE_PRICE_ANNUAL",
  "PAYMENTS_LIVE_WEBHOOK_SECRET",
  "PAYMENTS_SANDBOX_WEBHOOK_SECRET",
  "LOVABLE_API_KEY",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
] as const;

export const listInfraSecrets = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    return INFRA_SECRETS.map((name) => ({
      name,
      configured: Boolean(process.env[name]),
    }));
  });

export const checkIsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("user_roles")
      .select("id")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    return { isAdmin: Boolean(data) };
  });

export const claimFirstAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // Only allow if no admins currently exist.
    const { count } = await supabaseAdmin
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");
    if ((count ?? 0) > 0) throw new Error("An admin already exists");
    const { error } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: context.userId, role: "admin" } as never);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
