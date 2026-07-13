/**
 * Social Integration Framework — core types.
 *
 * Every platform (Instagram, TikTok, LinkedIn, X, YouTube, ...) implements
 * the `SocialAdapter` interface. The core app depends ONLY on these types.
 * Adding a new platform = new adapter file + one line in the registry.
 */

export type SocialPlatformId =
  | "instagram"
  | "facebook"
  | "threads"
  | "tiktok"
  | "linkedin"
  | "x"
  | "youtube"
  | "pinterest"
  | "bluesky"
  | "mastodon"
  | "gbp";

export type SocialCategory = "social" | "video" | "professional" | "presence";

export type Capability =
  | "publish"
  | "media_upload"
  | "comments"
  | "messages"
  | "webhooks"
  | "analytics"
  | "stories"
  | "reels";

export type ConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "expired"
  | "error";

export type TokenSet = {
  accessToken: string;
  refreshToken?: string;
  /** ISO timestamp. */
  expiresAt?: string;
  scope?: string;
  tokenType?: string;
  raw?: Record<string, unknown>;
};

export type AccountProfile = {
  id: string;
  handle: string;
  displayName: string;
  avatarUrl?: string;
  followers?: number;
  verified?: boolean;
  meta?: Record<string, unknown>;
};

export type PublishTarget = {
  id: string;
  label: string;
  kind: "profile" | "page" | "channel" | "board" | "group";
  avatarUrl?: string;
};

export type MediaAsset = {
  id: string;
  url: string;
  kind: "image" | "video" | "gif" | "document";
  mimeType?: string;
  width?: number;
  height?: number;
  durationSec?: number;
};

export type PublishInput = {
  targetId: string;
  text?: string;
  mediaIds?: string[];
  scheduledAt?: string;
  link?: string;
  altText?: string;
  meta?: Record<string, unknown>;
};

export type PublishResult = {
  externalId: string;
  url?: string;
  postedAt: string;
};

export type Comment = {
  id: string;
  authorHandle: string;
  authorName?: string;
  text: string;
  createdAt: string;
  parentId?: string;
  meta?: Record<string, unknown>;
};

export type WebhookSubscription = {
  id: string;
  event: string;
  callbackUrl: string;
};

export type AnalyticsMetric =
  | "followers"
  | "reach"
  | "impressions"
  | "engagement"
  | "likes"
  | "comments"
  | "shares"
  | "saves"
  | "profile_visits"
  | "website_clicks"
  | "video_views"
  | "watch_time";

export type AnalyticsPoint = {
  metric: AnalyticsMetric;
  ts: string; // ISO
  value: number;
  granularity: "hour" | "day" | "week";
  dimensions?: Record<string, string>;
};

export type DateRange = { start: string; end: string };

/**
 * Adapter runtime context. Injected by the framework; adapters never read
 * process.env, DB, or the network directly outside of their configured HTTP client.
 */
export type AdapterContext = {
  userId: string;
  orgId: string;
  connectionId: string;
  tokens: TokenSet;
  /** Persist new tokens after a refresh. Framework wires this to the token manager. */
  persistTokens(next: TokenSet): Promise<void>;
  /** Rate-limited fetch scoped to this platform/user. */
  fetch: typeof fetch;
  log: (event: string, data?: Record<string, unknown>) => void;
};

/** Typed errors — the framework decides retry/backoff/notify. */
export class AuthExpiredError extends Error { constructor(m = "auth expired") { super(m); } }
export class RateLimitError extends Error { retryAfterMs?: number; constructor(m = "rate limited", r?: number) { super(m); this.retryAfterMs = r; } }
export class MissingScopeError extends Error { scope?: string; constructor(m: string, s?: string) { super(m); this.scope = s; } }
export class UpstreamError extends Error { status?: number; constructor(m: string, s?: number) { super(m); this.status = s; } }
export class NotSupportedError extends Error { constructor(cap: Capability) { super(`capability not supported: ${cap}`); } }

/**
 * The single contract every platform integration MUST implement.
 * Unsupported capabilities throw `NotSupportedError` — never return silently.
 */
export interface SocialAdapter {
  readonly id: SocialPlatformId;
  readonly name: string;
  readonly category: SocialCategory;
  readonly capabilities: ReadonlySet<Capability>;

  /** Return the OAuth authorization URL to redirect the user to. */
  startConnect(input: { returnUrl: string; state: string }): Promise<{ authorizationUrl: string }>;
  /** Exchange the OAuth callback code for an initial token set. */
  completeConnect(input: { code: string; returnUrl: string }): Promise<TokenSet>;
  /** Revoke tokens upstream (best-effort). */
  disconnect(ctx: AdapterContext): Promise<void>;
  /** Refresh access token; MUST persist via ctx.persistTokens. */
  refresh(ctx: AdapterContext): Promise<TokenSet>;

  getProfile(ctx: AdapterContext): Promise<AccountProfile>;
  getAnalytics(ctx: AdapterContext, range: DateRange): Promise<AnalyticsPoint[]>;
  listPublishTargets(ctx: AdapterContext): Promise<PublishTarget[]>;

  publish(ctx: AdapterContext, input: PublishInput): Promise<PublishResult>;
  uploadMedia(ctx: AdapterContext, input: { url: string; kind: MediaAsset["kind"]; altText?: string }): Promise<MediaAsset>;
  listComments(ctx: AdapterContext, input: { externalPostId: string; since?: string }): Promise<Comment[]>;
  subscribeWebhook(ctx: AdapterContext, input: { event: string; callbackUrl: string; secret: string }): Promise<WebhookSubscription>;
}
