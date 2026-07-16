import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Returns whether the current user has connected any data sources.
 * Used to gate mocked/placeholder metrics: until the user connects
 * something, every KPI should read as zero / "no data".
 */
export const getConnectionStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const [social, accounts] = await Promise.all([
      supabase
        .from("social_connections")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId),
      supabase
        .from("account_connections")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId),
    ]);

    const socialCount = social.count ?? 0;
    const accountCount = accounts.count ?? 0;
    const total = socialCount + accountCount;

    return {
      hasConnections: total > 0,
      total,
      social: socialCount,
      accounts: accountCount,
    };
  });
