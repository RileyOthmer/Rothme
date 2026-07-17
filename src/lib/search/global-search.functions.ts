/**
 * Global search server function.
 * Searches across drafts, AI history, connected accounts, settings, and future
 * (scheduled) campaigns for the current user's organization. Returns small,
 * grouped result sets so the UI stays fast.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type SearchHit = {
  id: string;
  title: string;
  subtitle?: string;
  to: string;
  meta?: string;
};

export type SearchResults = {
  drafts: SearchHit[];
  future: SearchHit[];
  accounts: SearchHit[];
  ai: SearchHit[];
  settings: SearchHit[];
};

// Static settings index — searchable without a DB round-trip.
export const SETTINGS_INDEX: SearchHit[] = [
  { id: "s-profile", title: "Profile", subtitle: "Your name, avatar, account", to: "/settings/profile" },
  { id: "s-brand", title: "Brand Assets", subtitle: "Logo, colors, fonts, guidelines", to: "/settings/brand" },
  { id: "s-billing", title: "Billing & Subscription", subtitle: "Plan, invoices, payment method", to: "/settings/billing" },
  { id: "s-notifications", title: "Notification Settings", subtitle: "Channels, categories, quiet hours", to: "/settings/notifications" },
  { id: "s-platforms", title: "Connected Platforms", subtitle: "Facebook, Instagram, Google, and more", to: "/settings/platforms" },
  { id: "s-social", title: "Social Accounts", subtitle: "Reconnect or disconnect accounts", to: "/settings/social-accounts" },
  { id: "s-health", title: "Social Health", subtitle: "Connection health & permissions", to: "/settings/social-health" },
  { id: "s-developer", title: "Developer", subtitle: "API keys, webhooks", to: "/settings/developer" },
  { id: "s-plugins", title: "Plugins", subtitle: "Installed integrations", to: "/settings/plugins" },
  { id: "s-connections", title: "Connections", subtitle: "Third-party services", to: "/settings/connections" },
];

const escapeLike = (s: string) => s.replace(/[\\%_]/g, (m) => `\\${m}`);

export const globalSearch = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { q: string }) =>
    z.object({ q: z.string().max(120) }).parse(input),
  )
  .handler(async ({ data, context }): Promise<SearchResults> => {
    const raw = data.q.trim();
    const q = raw.toLowerCase();
    const like = `%${escapeLike(raw)}%`;
    const hasQuery = raw.length > 0;

    // Run the DB queries in parallel — each capped at 5 rows.
    const [draftsRes, futureRes, accountsRes, aiRes] = await Promise.all([
      hasQuery
        ? context.supabase
            .from("posts")
            .select("id, title, body, updated_at")
            .eq("status", "draft")
            .or(`title.ilike.${like},body.ilike.${like}`)
            .order("updated_at", { ascending: false })
            .limit(5)
        : context.supabase
            .from("posts")
            .select("id, title, body, updated_at")
            .eq("status", "draft")
            .order("updated_at", { ascending: false })
            .limit(5),

      hasQuery
        ? context.supabase
            .from("posts")
            .select("id, title, body, updated_at")
            .in("status", ["scheduled", "publishing"])
            .or(`title.ilike.${like},body.ilike.${like}`)
            .order("updated_at", { ascending: false })
            .limit(5)
        : context.supabase
            .from("posts")
            .select("id, title, body, updated_at")
            .in("status", ["scheduled", "publishing"])
            .order("updated_at", { ascending: false })
            .limit(5),

      hasQuery
        ? context.supabase
            .from("social_accounts")
            .select("id, platform, username, display_name, connection_status")
            .eq("user_id", context.userId)
            .or(
              `platform.ilike.${like},username.ilike.${like},display_name.ilike.${like}`,
            )
            .limit(5)
        : context.supabase
            .from("social_accounts")
            .select("id, platform, username, display_name, connection_status")
            .eq("user_id", context.userId)
            .order("connected_at", { ascending: false })
            .limit(5),

      hasQuery
        ? context.supabase
            .from("activity_events")
            .select("id, verb, summary, created_at")
            .ilike("verb", "ai%")
            .ilike("summary", like)
            .order("created_at", { ascending: false })
            .limit(5)
        : context.supabase
            .from("activity_events")
            .select("id, verb, summary, created_at")
            .ilike("verb", "ai%")
            .order("created_at", { ascending: false })
            .limit(5),
    ]);

    const drafts: SearchHit[] = (draftsRes.data ?? []).map((r: any) => ({
      id: r.id,
      title: r.title?.trim() || "Untitled draft",
      subtitle: (r.body || "").slice(0, 80),
      to: `/publishing/compose?id=${r.id}`,
    }));

    const future: SearchHit[] = (futureRes.data ?? []).map((r: any) => ({
      id: r.id,
      title: r.title?.trim() || "Untitled campaign",
      subtitle: (r.body || "").slice(0, 80),
      to: `/publishing/queue`,
    }));

    const accounts: SearchHit[] = (accountsRes.data ?? []).map((r: any) => ({
      id: r.id,
      title: r.display_name || r.username || r.platform,
      subtitle: `${r.platform}${r.connection_status ? ` · ${r.connection_status}` : ""}`,
      to: `/settings/platforms`,
    }));

    const ai: SearchHit[] = (aiRes.data ?? []).map((r: any) => ({
      id: r.id,
      title: r.summary || r.verb,
      subtitle: r.verb,
      to: `/assistant`,
    }));

    const settings = SETTINGS_INDEX.filter((s) =>
      hasQuery
        ? s.title.toLowerCase().includes(q) ||
          (s.subtitle ?? "").toLowerCase().includes(q)
        : true,
    ).slice(0, hasQuery ? 5 : 6);

    return { drafts, future, accounts, ai, settings };
  });
