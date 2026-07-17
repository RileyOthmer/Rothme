/**
 * Facebook (Meta Graph API) adapter.
 *
 * Uses Facebook Login for Business + Graph API v24.0. Publishes to Pages the
 * connected user administers; analytics come from Page Insights.
 *
 * Required env (server-only):
 *   - FACEBOOK_APP_ID
 *   - FACEBOOK_APP_SECRET
 * Optional:
 *   - FACEBOOK_OAUTH_SCOPES (comma-separated; defaults below)
 *
 * OAuth: standard authorization-code flow. Long-lived user token is exchanged
 * on completeConnect; page tokens are looked up per-target on publish.
 *
 * Docs: https://developers.facebook.com/docs/graph-api
 */
import type {
  AccountProfile,
  AdapterContext,
  AnalyticsPoint,
  Comment,
  DateRange,
  MediaAsset,
  PublishInput,
  PublishResult,
  PublishTarget,
  SocialAdapter,
  TokenSet,
  WebhookSubscription,
} from "../types";
import { AuthExpiredError, MissingScopeError, RateLimitError, UpstreamError } from "../types";

const GRAPH = "https://graph.facebook.com/v24.0";
const OAUTH = "https://www.facebook.com/v24.0/dialog/oauth";
const DEFAULT_SCOPES = [
  "public_profile",
  "email",
  "pages_show_list",
  "pages_read_engagement",
  "pages_read_user_content",
  "pages_manage_posts",
  "pages_manage_metadata",
  "read_insights",
  "business_management",
];

function appCreds() {
  const id = process.env.FACEBOOK_APP_ID;
  const secret = process.env.FACEBOOK_APP_SECRET;
  if (!id || !secret) throw new Error("Facebook adapter: FACEBOOK_APP_ID / FACEBOOK_APP_SECRET not configured");
  return { id, secret };
}

async function graph<T = unknown>(
  ctx: AdapterContext,
  path: string,
  init: RequestInit & { params?: Record<string, string | number | undefined>; token?: string } = {},
): Promise<T> {
  const { params, token, ...rest } = init;
  const url = new URL(`${GRAPH}${path.startsWith("/") ? path : `/${path}`}`);
  if (params) for (const [k, v] of Object.entries(params)) if (v !== undefined) url.searchParams.set(k, String(v));
  const access = token ?? ctx.tokens.accessToken;
  if (access) url.searchParams.set("access_token", access);

  const res = await ctx.fetch(url.toString(), rest);
  const text = await res.text();
  const body = text ? (JSON.parse(text) as { error?: { code?: number; type?: string; message?: string; error_subcode?: number } }) : {};

  if (!res.ok || (body as { error?: unknown }).error) {
    const err = (body as { error?: { code?: number; message?: string; type?: string } }).error ?? {};
    const msg = err.message ?? `Facebook Graph ${res.status}`;
    // 190 = invalid/expired token, 102 = session issue
    if (err.code === 190 || err.code === 102 || res.status === 401) throw new AuthExpiredError(msg);
    if (res.status === 429 || err.code === 4 || err.code === 17 || err.code === 32) {
      const retry = Number(res.headers.get("retry-after") ?? "0") * 1000 || undefined;
      throw new RateLimitError(msg, retry);
    }
    if (err.code === 200 || err.type === "OAuthException") throw new MissingScopeError(msg);
    throw new UpstreamError(msg, res.status);
  }
  return body as T;
}

function toISO(unixOrString: number | string): string {
  if (typeof unixOrString === "number") return new Date(unixOrString * 1000).toISOString();
  return new Date(unixOrString).toISOString();
}

type PageEdge = { id: string; name: string; access_token: string; category?: string; picture?: { data?: { url?: string } } };
type MeResp = { id: string; name: string; email?: string; picture?: { data?: { url?: string } } };

async function pageTokenFor(ctx: AdapterContext, pageId: string): Promise<string> {
  const p = await graph<{ access_token: string }>(ctx, `/${pageId}`, { params: { fields: "access_token" } });
  if (!p.access_token) throw new MissingScopeError(`No page access token for ${pageId} — grant pages_manage_posts`);
  return p.access_token;
}

export function createFacebookAdapter(): SocialAdapter {
  const capabilities = new Set([
    "publish", "media_upload", "comments", "webhooks", "analytics",
  ] as const);

  return {
    id: "facebook",
    name: "Facebook",
    category: "social",
    capabilities,

    async startConnect({ returnUrl, state }) {
      const { id } = appCreds();
      const scopes = (process.env.FACEBOOK_OAUTH_SCOPES?.split(",").map((s) => s.trim()).filter(Boolean)) ?? DEFAULT_SCOPES;
      const u = new URL(OAUTH);
      u.searchParams.set("client_id", id);
      u.searchParams.set("redirect_uri", returnUrl);
      u.searchParams.set("state", state);
      u.searchParams.set("response_type", "code");
      u.searchParams.set("scope", scopes.join(","));
      return { authorizationUrl: u.toString() };
    },

    async completeConnect({ code, returnUrl }) {
      const { id, secret } = appCreds();
      // 1. short-lived user token
      const shortUrl = new URL(`${GRAPH}/oauth/access_token`);
      shortUrl.searchParams.set("client_id", id);
      shortUrl.searchParams.set("client_secret", secret);
      shortUrl.searchParams.set("redirect_uri", returnUrl);
      shortUrl.searchParams.set("code", code);
      const shortRes = await fetch(shortUrl.toString());
      const short = (await shortRes.json()) as { access_token?: string; error?: { message?: string } };
      if (!shortRes.ok || !short.access_token) throw new UpstreamError(short.error?.message ?? "OAuth exchange failed", shortRes.status);

      // 2. exchange for long-lived (~60d) user token
      const longUrl = new URL(`${GRAPH}/oauth/access_token`);
      longUrl.searchParams.set("grant_type", "fb_exchange_token");
      longUrl.searchParams.set("client_id", id);
      longUrl.searchParams.set("client_secret", secret);
      longUrl.searchParams.set("fb_exchange_token", short.access_token);
      const longRes = await fetch(longUrl.toString());
      const long = (await longRes.json()) as { access_token: string; token_type?: string; expires_in?: number };
      if (!longRes.ok || !long.access_token) throw new UpstreamError("Long-lived token exchange failed", longRes.status);

      return {
        accessToken: long.access_token,
        tokenType: long.token_type ?? "bearer",
        expiresAt: long.expires_in ? new Date(Date.now() + long.expires_in * 1000).toISOString() : undefined,
        scope: DEFAULT_SCOPES.join(","),
      };
    },

    async disconnect(ctx) {
      try { await graph(ctx, `/me/permissions`, { method: "DELETE" }); } catch { /* best effort */ }
    },

    async refresh(ctx): Promise<TokenSet> {
      // Long-lived user tokens can be re-extended by re-exchanging.
      const { id, secret } = appCreds();
      const u = new URL(`${GRAPH}/oauth/access_token`);
      u.searchParams.set("grant_type", "fb_exchange_token");
      u.searchParams.set("client_id", id);
      u.searchParams.set("client_secret", secret);
      u.searchParams.set("fb_exchange_token", ctx.tokens.accessToken);
      const r = await ctx.fetch(u.toString());
      if (!r.ok) throw new AuthExpiredError("Facebook refresh failed");
      const j = (await r.json()) as { access_token: string; expires_in?: number };
      const next: TokenSet = {
        ...ctx.tokens,
        accessToken: j.access_token,
        expiresAt: j.expires_in ? new Date(Date.now() + j.expires_in * 1000).toISOString() : undefined,
      };
      await ctx.persistTokens(next);
      return next;
    },

    async getProfile(ctx): Promise<AccountProfile> {
      const me = await graph<MeResp>(ctx, "/me", { params: { fields: "id,name,email,picture.type(large)" } });
      return {
        id: me.id,
        handle: me.email ?? me.id,
        displayName: me.name,
        avatarUrl: me.picture?.data?.url,
      };
    },

    async listPublishTargets(ctx): Promise<PublishTarget[]> {
      const pages = await graph<{ data: PageEdge[] }>(ctx, "/me/accounts", {
        params: { fields: "id,name,category,access_token,picture" },
      });
      return pages.data.map((p) => ({
        id: p.id,
        label: p.name,
        kind: "page",
        avatarUrl: p.picture?.data?.url,
      }));
    },

    async getAnalytics(ctx, range: DateRange): Promise<AnalyticsPoint[]> {
      const pages = await graph<{ data: PageEdge[] }>(ctx, "/me/accounts", { params: { fields: "id,access_token" } });
      const out: AnalyticsPoint[] = [];
      const since = Math.floor(new Date(range.start).getTime() / 1000);
      const until = Math.floor(new Date(range.end).getTime() / 1000);
      const metricMap: Record<string, AnalyticsPoint["metric"]> = {
        page_impressions: "impressions",
        page_impressions_unique: "reach",
        page_post_engagements: "engagement",
        page_fans: "followers",
        page_views_total: "profile_visits",
        page_video_views: "video_views",
      };
      const metricNames = Object.keys(metricMap).join(",");

      for (const page of pages.data) {
        try {
          const insights = await graph<{ data: Array<{ name: string; values: Array<{ end_time: string; value: number }> }> }>(
            ctx, `/${page.id}/insights`,
            { token: page.access_token, params: { metric: metricNames, period: "day", since, until } },
          );
          for (const series of insights.data) {
            const unified = metricMap[series.name];
            if (!unified) continue;
            for (const v of series.values) {
              out.push({
                metric: unified,
                ts: toISO(v.end_time),
                value: Number(v.value ?? 0),
                granularity: "day",
                dimensions: { page_id: page.id },
              });
            }
          }
        } catch (e) {
          ctx.log("facebook.insights_failed", { pageId: page.id, error: (e as Error).message });
        }
      }
      return out;
    },

    async publish(ctx, input: PublishInput): Promise<PublishResult> {
      const token = await pageTokenFor(ctx, input.targetId);
      const body = new URLSearchParams();
      if (input.text) body.set("message", input.text);
      if (input.link) body.set("link", input.link);
      if (input.scheduledAt) {
        body.set("published", "false");
        body.set("scheduled_publish_time", String(Math.floor(new Date(input.scheduledAt).getTime() / 1000)));
      }
      if (input.mediaIds?.length) body.set("attached_media", JSON.stringify(input.mediaIds.map((id) => ({ media_fbid: id }))));

      const r = await graph<{ id: string; post_id?: string }>(ctx, `/${input.targetId}/feed`, {
        method: "POST", token, body,
      });
      const externalId = r.post_id ?? r.id;
      return {
        externalId,
        url: `https://www.facebook.com/${externalId}`,
        postedAt: input.scheduledAt ?? new Date().toISOString(),
      };
    },

    async uploadMedia(ctx, input): Promise<MediaAsset> {
      // Media is uploaded against the first available Page; caller specifies via meta if needed.
      const pages = await graph<{ data: PageEdge[] }>(ctx, "/me/accounts", { params: { fields: "id,access_token" } });
      const page = pages.data[0];
      if (!page) throw new MissingScopeError("No manageable Page available for media upload");
      const body = new URLSearchParams({ url: input.url, published: "false" });
      const endpoint = input.kind === "video" ? `/${page.id}/videos` : `/${page.id}/photos`;
      const r = await graph<{ id: string }>(ctx, endpoint, { method: "POST", token: page.access_token, body });
      return { id: r.id, url: input.url, kind: input.kind };
    },

    async listComments(ctx, input): Promise<Comment[]> {
      const r = await graph<{ data: Array<{ id: string; from?: { name?: string; id?: string }; message?: string; created_time: string; parent?: { id: string } }> }>(
        ctx, `/${input.externalPostId}/comments`,
        { params: { fields: "id,from,message,created_time,parent", since: input.since } },
      );
      return r.data.map((c) => ({
        id: c.id,
        authorHandle: c.from?.id ?? "unknown",
        authorName: c.from?.name,
        text: c.message ?? "",
        createdAt: toISO(c.created_time),
        parentId: c.parent?.id,
      }));
    },

    async subscribeWebhook(ctx, input): Promise<WebhookSubscription> {
      // Page-level webhook subscription. The Meta App itself must have the
      // webhook product configured with `callbackUrl` and `verify_token` in
      // the App Dashboard; this call opts a specific Page into events.
      const pages = await graph<{ data: PageEdge[] }>(ctx, "/me/accounts", { params: { fields: "id,access_token" } });
      const results: string[] = [];
      for (const page of pages.data) {
        const body = new URLSearchParams({ subscribed_fields: input.event });
        await graph(ctx, `/${page.id}/subscribed_apps`, { method: "POST", token: page.access_token, body });
        results.push(page.id);
      }
      return { id: `fb-sub-${results.join(",")}`, event: input.event, callbackUrl: input.callbackUrl };
    },
  };
}
