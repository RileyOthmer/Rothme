/**
 * Master-admin-only role management.
 *
 * Only the master admin (email hard-configured in the database via
 * public.master_admin_email()) can list, grant, or revoke admin roles.
 * All handlers re-verify master-admin status server-side.
 */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const MASTER_ADMIN_EMAIL = "rileyothmer67@gmail.com";

async function assertMasterAdmin(userId: string): Promise<void> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);
  if (error || !data?.user) throw new Error("Forbidden");
  if ((data.user.email ?? "").toLowerCase() !== MASTER_ADMIN_EMAIL) {
    throw new Error("Forbidden: master admin only");
  }
}

export type AdminUserRow = {
  userId: string;
  email: string | null;
  fullName: string | null;
  isMaster: boolean;
  grantedAt: string | null;
};

export const checkIsMasterAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin.auth.admin.getUserById(context.userId);
    const email = (data?.user?.email ?? "").toLowerCase();
    return { isMasterAdmin: email === MASTER_ADMIN_EMAIL };
  });

export const listAdmins = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminUserRow[]> => {
    await assertMasterAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: roleRows, error } = await supabaseAdmin
      .from("user_roles")
      .select("user_id, created_at")
      .eq("role", "admin");
    if (error) throw new Error(error.message);

    const rows = (roleRows ?? []) as Array<{ user_id: string; created_at: string | null }>;

    // Fetch user + profile info in parallel.
    const enriched = await Promise.all(
      rows.map(async (r) => {
        const [{ data: authData }, { data: profile }] = await Promise.all([
          supabaseAdmin.auth.admin.getUserById(r.user_id),
          supabaseAdmin
            .from("profiles")
            .select("full_name")
            .eq("id", r.user_id)
            .maybeSingle(),
        ]);
        const email = authData?.user?.email ?? null;
        return {
          userId: r.user_id,
          email,
          fullName: (profile as { full_name?: string | null } | null)?.full_name ?? null,
          isMaster: (email ?? "").toLowerCase() === MASTER_ADMIN_EMAIL,
          grantedAt: r.created_at,
        } satisfies AdminUserRow;
      }),
    );

    // Master admin always first, then most recent grants.
    enriched.sort((a, b) => {
      if (a.isMaster !== b.isMaster) return a.isMaster ? -1 : 1;
      return (b.grantedAt ?? "").localeCompare(a.grantedAt ?? "");
    });

    return enriched;
  });

export const grantAdminByEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { email: string }) => {
    const email = (data?.email ?? "").trim().toLowerCase();
    if (!email || !email.includes("@")) throw new Error("A valid email is required");
    return { email };
  })
  .handler(async ({ data, context }) => {
    await assertMasterAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Look up the user by email. listUsers is paginated; scan a few pages.
    let target: { id: string; email: string | null } | null = null;
    for (let page = 1; page <= 20 && !target; page++) {
      const { data: list, error } = await supabaseAdmin.auth.admin.listUsers({
        page,
        perPage: 200,
      });
      if (error) throw new Error(error.message);
      const found = list.users.find((u) => (u.email ?? "").toLowerCase() === data.email);
      if (found) target = { id: found.id, email: found.email ?? null };
      if (list.users.length < 200) break;
    }
    if (!target) {
      throw new Error(
        `No user with email ${data.email} has signed up yet. Ask them to create an account first.`,
      );
    }

    const { error: insErr } = await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: target.id, role: "admin" }, { onConflict: "user_id,role" });
    if (insErr) throw new Error(insErr.message);

    return { ok: true, userId: target.id, email: target.email };
  });

export const revokeAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { userId: string }) => {
    if (!data?.userId) throw new Error("userId is required");
    return { userId: data.userId };
  })
  .handler(async ({ data, context }) => {
    await assertMasterAdmin(context.userId);
    if (data.userId === context.userId) {
      throw new Error("You cannot revoke your own admin role.");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // Extra safety: verify target isn't the master admin.
    const { data: authData } = await supabaseAdmin.auth.admin.getUserById(data.userId);
    const targetEmail = (authData?.user?.email ?? "").toLowerCase();
    if (targetEmail === MASTER_ADMIN_EMAIL) {
      throw new Error("The master admin role cannot be revoked.");
    }
    const { error } = await supabaseAdmin
      .from("user_roles")
      .delete()
      .eq("user_id", data.userId)
      .eq("role", "admin");
    if (error) throw new Error(error.message);
    return { ok: true };
  });
