/**
 * OAuth callback endpoint.
 * URL: /api/public/oauth/:platform/callback
 *
 * The platform redirects here with ?code&state (or ?error). We:
 *   1. Look up the pending oauth_states row (RLS-safe via user_id join once
 *      we identify the state's owner using the service client).
 *   2. Exchange the code for tokens via the platform adapter.
 *   3. Fetch the profile.
 *   4. Encrypt & upsert into social_accounts.
 *   5. Redirect the user back to the success screen.
 *
 * Public route (no auth cookie needed) because the browser is coming back from
 * the third-party OAuth screen. The state token itself binds the callback to a
 * signed-in user; without a matching row we reject.
 */
import { createFileRoute } from "@tanstack/react-router";
import { getPlatform } from "@/lib/social-connections/platforms";

function redirectHome(url: URL, params: Record<string, string>) {
  const target = new URL("/settings/social-accounts", url.origin);
  for (const [k, v] of Object.entries(params)) target.searchParams.set(k, v);
  return new Response(null, { status: 303, headers: { Location: target.toString() } });
}

export const Route = createFileRoute("/api/public/oauth/$platform/callback")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const url = new URL(request.url);
        const platformId = params.platform;
        const platform = getPlatform(platformId);
        if (!platform) return redirectHome(url, { status: "error", reason: "unknown_platform" });

        const error = url.searchParams.get("error");
        if (error) {
          return redirectHome(url, { status: "error", reason: error, platform: platformId });
        }
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        if (!code || !state) return redirectHome(url, { status: "error", reason: "missing_code_or_state" });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        // Resolve state → user + code_verifier
        const { data: stateRow, error: stateErr } = await supabaseAdmin
          .from("oauth_states")
          .select("state, user_id, platform, code_verifier, expires_at")
          .eq("state", state)
          .maybeSingle();
        if (stateErr || !stateRow) {
          return redirectHome(url, { status: "error", reason: "invalid_state" });
        }
        if (new Date(stateRow.expires_at).getTime() < Date.now()) {
          await supabaseAdmin.from("oauth_states").delete().eq("state", state);
          return redirectHome(url, { status: "error", reason: "state_expired" });
        }
        if (stateRow.platform !== platformId) {
          return redirectHome(url, { status: "error", reason: "platform_mismatch" });
        }

        // Best-effort cleanup regardless of outcome
        await supabaseAdmin.from("oauth_states").delete().eq("state", state);

        try {
          const { getAdapter } = await import("@/lib/social-connections/adapter.server");
          const { encryptJson } = await import("@/lib/integrations/crypto.server");
          const adapter = getAdapter(platformId);
          const redirectUri = `${url.origin}/api/public/oauth/${platformId}/callback`;
          const tokens = await adapter.exchangeToken({
            code,
            redirectUri,
            codeVerifier: stateRow.code_verifier ?? undefined,
          });
          const profile = await adapter.syncProfile({ accessToken: tokens.accessToken });
          const expiresAt = tokens.expiresIn
            ? new Date(Date.now() + tokens.expiresIn * 1000).toISOString()
            : null;

          const { error: upErr } = await supabaseAdmin
            .from("social_accounts")
            .upsert(
              {
                user_id: stateRow.user_id,
                platform: platformId,
                platform_account_id: profile.platformAccountId || null,
                username: profile.username,
                display_name: profile.displayName,
                avatar_url: profile.avatarUrl,
                encrypted_access_token: encryptJson({ accessToken: tokens.accessToken }),
                encrypted_refresh_token: tokens.refreshToken
                  ? encryptJson({ refreshToken: tokens.refreshToken })
                  : null,
                token_expiration: expiresAt,
                scopes: tokens.scope ? tokens.scope.split(/\s+/) : platform.scopes,
                connection_status: "connected",
                last_error: null,
                connected_at: new Date().toISOString(),
                last_sync: new Date().toISOString(),
              },
              { onConflict: "user_id,platform,platform_account_id" },
            );
          if (upErr) throw new Error(upErr.message);

          // Log activity to the user's active org (best-effort).
          try {
            const { data: prof } = await supabaseAdmin
              .from("profiles").select("active_org_id").eq("id", stateRow.user_id).maybeSingle();
            if (prof?.active_org_id) {
              const platformLabel = platform.name;
              const accountLabel = profile.displayName || profile.username || "account";
              await supabaseAdmin.from("activity_events").insert({
                org_id: prof.active_org_id,
                actor_id: stateRow.user_id,
                verb: "connection.created",
                subject_type: "social_account",
                subject_id: platformId,
                summary: `${platformLabel} connected — ${accountLabel}`,
              });
            }
          } catch { /* non-fatal */ }

          try {
            const { notifyUser } = await import("@/lib/notifications/notify.server");
            const accountLabel = profile.displayName || profile.username || "account";
            await notifyUser(supabaseAdmin, {
              userId: stateRow.user_id,
              kind: "connection.success",
              title: `${platform.name} connected`,
              body: `Successfully connected ${accountLabel}.`,
              severity: "opportunity",
              dedupeKey: `connection.success:${platformId}:${profile.platformAccountId ?? profile.username ?? ""}`,
              metadata: { platform: platformId },
            });
          } catch { /* non-fatal */ }

          return redirectHome(url, { status: "success", platform: platformId });
        } catch (e) {
          const message = e instanceof Error ? e.message : "OAuth failed";
          try {
            const { notifyUser } = await import("@/lib/notifications/notify.server");
            await notifyUser(supabaseAdmin, {
              userId: stateRow.user_id,
              kind: "connection.failed",
              title: `${platform.name} failed to connect`,
              body: message.slice(0, 200),
              severity: "critical",
              dedupeKey: `connection.failed:${platformId}:${Date.now()}`,
              metadata: { platform: platformId },
            });
          } catch { /* non-fatal */ }
          return redirectHome(url, {
            status: "error",
            reason: "exchange_failed",
            platform: platformId,
            message: message.slice(0, 200),
          });
        }
      },
    },
  },
});
