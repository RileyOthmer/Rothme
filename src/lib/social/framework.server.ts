/**
 * Social Integration Framework — server-side services.
 *
 * SERVER-ONLY. Never import from a client bundle.
 *
 * This module wires the adapter contract into the app's runtime:
 *   - IntegrationManager     : lifecycle + capability queries
 *   - OAuthConnectionManager : OAuth start/callback flow
 *   - TokenManager           : storage, refresh scheduling, expiry
 *   - ApiClient              : fetch wrapper w/ retries, timeouts, tracing
 *   - RateLimiter            : per-user/per-platform token-bucket limiter
 *   - WebhookManager         : subscribe/verify/dispatch
 *   - BackgroundSyncService  : periodic analytics + inbox sync
 *   - AnalyticsMapper        : adapter output → unified MetricSnapshot
 *   - PublishingService      : cross-platform publish orchestration
 *   - MediaUploadService     : upload → cache → hand to adapter
 *   - ErrorHandler           : classifies + surfaces adapter errors
 *   - Logger                 : structured logs w/ request id
 *
 * Storage is left behind a `SocialStore` interface so this file has no
 * DB coupling — a Supabase-backed impl lives alongside where it's wired.
 */
import {
  AuthExpiredError,
  MissingScopeError,
  NotSupportedError,
  RateLimitError,
  UpstreamError,
  type AdapterContext,
  type AnalyticsPoint,
  type Capability,
  type Comment,
  type DateRange,
  type MediaAsset,
  type PublishInput,
  type PublishResult,
  type SocialAdapter,
  type SocialPlatformId,
  type TokenSet,
  type WebhookSubscription,
} from "./types";
import { bootstrapSocialAdapters, getAdapter, listAdapters } from "./registry";

// ---------------------------------------------------------------------------
// Logger
// ---------------------------------------------------------------------------

export type LogLevel = "debug" | "info" | "warn" | "error";
export type LogEntry = {
  ts: string;
  level: LogLevel;
  scope: string;
  event: string;
  data?: Record<string, unknown>;
  requestId?: string;
};

export class Logger {
  constructor(private scope: string, private requestId?: string) {}
  child(scope: string) { return new Logger(`${this.scope}:${scope}`, this.requestId); }
  private emit(level: LogLevel, event: string, data?: Record<string, unknown>) {
    const entry: LogEntry = { ts: new Date().toISOString(), level, scope: this.scope, event, data, requestId: this.requestId };
    // Structured single-line log — pipe to any collector later.
    // eslint-disable-next-line no-console
    console[level === "debug" ? "log" : level](JSON.stringify(entry));
  }
  debug(event: string, data?: Record<string, unknown>) { this.emit("debug", event, data); }
  info(event: string, data?: Record<string, unknown>) { this.emit("info", event, data); }
  warn(event: string, data?: Record<string, unknown>) { this.emit("warn", event, data); }
  error(event: string, data?: Record<string, unknown>) { this.emit("error", event, data); }
}

// ---------------------------------------------------------------------------
// Error handler
// ---------------------------------------------------------------------------

export type ClassifiedError =
  | { kind: "auth"; message: string; recoverable: true }
  | { kind: "rate_limit"; retryAfterMs: number; recoverable: true }
  | { kind: "missing_scope"; scope?: string; recoverable: false }
  | { kind: "upstream"; status?: number; message: string; recoverable: boolean }
  | { kind: "not_supported"; message: string; recoverable: false }
  | { kind: "unknown"; message: string; recoverable: false };

export function classifyError(e: unknown): ClassifiedError {
  if (e instanceof AuthExpiredError) return { kind: "auth", message: e.message, recoverable: true };
  if (e instanceof RateLimitError)   return { kind: "rate_limit", retryAfterMs: e.retryAfterMs ?? 30_000, recoverable: true };
  if (e instanceof MissingScopeError) return { kind: "missing_scope", scope: e.scope, recoverable: false };
  if (e instanceof NotSupportedError) return { kind: "not_supported", message: e.message, recoverable: false };
  if (e instanceof UpstreamError)    return { kind: "upstream", status: e.status, message: e.message, recoverable: (e.status ?? 500) >= 500 };
  return { kind: "unknown", message: e instanceof Error ? e.message : String(e), recoverable: false };
}

// ---------------------------------------------------------------------------
// Rate limiter (token bucket, per key)
// ---------------------------------------------------------------------------

type Bucket = { tokens: number; updatedAt: number };
export class RateLimiter {
  private buckets = new Map<string, Bucket>();
  constructor(private capacity: number, private refillPerSec: number) {}
  async take(key: string, cost = 1): Promise<void> {
    const now = Date.now();
    const b = this.buckets.get(key) ?? { tokens: this.capacity, updatedAt: now };
    const elapsed = (now - b.updatedAt) / 1000;
    b.tokens = Math.min(this.capacity, b.tokens + elapsed * this.refillPerSec);
    b.updatedAt = now;
    if (b.tokens < cost) {
      const waitMs = Math.ceil(((cost - b.tokens) / this.refillPerSec) * 1000);
      this.buckets.set(key, b);
      throw new RateLimitError("local rate limit", waitMs);
    }
    b.tokens -= cost;
    this.buckets.set(key, b);
  }
}

// ---------------------------------------------------------------------------
// API client
// ---------------------------------------------------------------------------

export type ApiClientOptions = {
  timeoutMs?: number;
  retries?: number;
  limiter?: RateLimiter;
  limiterKey?: string;
  logger?: Logger;
};

export function createApiClient(opts: ApiClientOptions = {}): typeof fetch {
  const { timeoutMs = 15_000, retries = 2, limiter, limiterKey = "default", logger } = opts;
  return (async (input: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]) => {
    let attempt = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (limiter) await limiter.take(limiterKey);
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), timeoutMs);
      try {
        const res = await fetch(input, { ...init, signal: ctrl.signal });
        clearTimeout(t);
        if (res.status === 401 || res.status === 403) throw new AuthExpiredError(`HTTP ${res.status}`);
        if (res.status === 429) {
          const retryAfter = Number(res.headers.get("retry-after") ?? "1") * 1000;
          throw new RateLimitError("upstream 429", retryAfter);
        }
        if (res.status >= 500) throw new UpstreamError(await res.text().catch(() => res.statusText), res.status);
        return res;
      } catch (e) {
        clearTimeout(t);
        const cls = classifyError(e);
        logger?.warn("api.error", { attempt, cls });
        if (attempt++ >= retries || !cls.recoverable) throw e;
        const backoff = cls.kind === "rate_limit" ? cls.retryAfterMs : 250 * 2 ** attempt;
        await new Promise((r) => setTimeout(r, backoff));
      }
    }
  }) as typeof fetch;
}

// ---------------------------------------------------------------------------
// Storage contract (adapter-agnostic)
// ---------------------------------------------------------------------------

export type ConnectionRow = {
  id: string;
  userId: string;
  orgId: string;
  platform: SocialPlatformId;
  tokens: TokenSet;
  externalAccountId?: string;
  createdAt: string;
  updatedAt: string;
};

export interface SocialStore {
  getConnection(id: string): Promise<ConnectionRow | null>;
  listConnections(orgId: string): Promise<ConnectionRow[]>;
  saveConnection(row: Omit<ConnectionRow, "createdAt" | "updatedAt"> & { createdAt?: string }): Promise<ConnectionRow>;
  updateTokens(id: string, tokens: TokenSet): Promise<void>;
  deleteConnection(id: string): Promise<void>;
  logEvent(entry: LogEntry): Promise<void>;
}

// ---------------------------------------------------------------------------
// Token manager
// ---------------------------------------------------------------------------

export class TokenManager {
  constructor(private store: SocialStore, private logger: Logger) {}

  isExpired(t: TokenSet, skewMs = 60_000): boolean {
    if (!t.expiresAt) return false;
    return new Date(t.expiresAt).getTime() - skewMs <= Date.now();
  }

  async ensureFresh(connection: ConnectionRow, adapter: SocialAdapter): Promise<TokenSet> {
    if (!this.isExpired(connection.tokens)) return connection.tokens;
    this.logger.info("token.refresh", { connectionId: connection.id, platform: connection.platform });
    const ctx = this.buildRefreshCtx(connection);
    const next = await adapter.refresh(ctx);
    await this.store.updateTokens(connection.id, next);
    return next;
  }

  private buildRefreshCtx(c: ConnectionRow): AdapterContext {
    return {
      userId: c.userId, orgId: c.orgId, connectionId: c.id, tokens: c.tokens,
      persistTokens: async (t) => this.store.updateTokens(c.id, t),
      fetch: createApiClient({ logger: this.logger }),
      log: (event, data) => this.logger.info(event, data),
    };
  }
}

// ---------------------------------------------------------------------------
// OAuth connection manager
// ---------------------------------------------------------------------------

export class OAuthConnectionManager {
  constructor(private store: SocialStore, private logger: Logger) {}

  async start(platform: SocialPlatformId, input: { returnUrl: string; state: string }) {
    const adapter = requireAdapter(platform);
    this.logger.info("oauth.start", { platform });
    return adapter.startConnect(input);
  }

  async complete(input: {
    platform: SocialPlatformId; code: string; returnUrl: string;
    userId: string; orgId: string;
  }): Promise<ConnectionRow> {
    const adapter = requireAdapter(input.platform);
    const tokens = await adapter.completeConnect({ code: input.code, returnUrl: input.returnUrl });
    const row = await this.store.saveConnection({
      id: cryptoRandomId(),
      userId: input.userId, orgId: input.orgId, platform: input.platform, tokens,
    });
    // Prime profile lookup (best-effort, non-fatal).
    try {
      const profile = await adapter.getProfile(buildCtx(row, this.store, this.logger));
      await this.store.saveConnection({ ...row, externalAccountId: profile.id });
    } catch (e) {
      this.logger.warn("oauth.profile_prime_failed", { err: classifyError(e) });
    }
    return row;
  }

  async disconnect(connectionId: string) {
    const row = await this.store.getConnection(connectionId);
    if (!row) return;
    const adapter = requireAdapter(row.platform);
    try { await adapter.disconnect(buildCtx(row, this.store, this.logger)); }
    catch (e) { this.logger.warn("oauth.disconnect_upstream_failed", { err: classifyError(e) }); }
    await this.store.deleteConnection(connectionId);
  }
}

// ---------------------------------------------------------------------------
// Analytics mapper (adapter output → unified snapshots)
// ---------------------------------------------------------------------------

export type UnifiedSnapshot = {
  provider: SocialPlatformId;
  metric: AnalyticsPoint["metric"];
  ts: string;
  value: number;
  granularity: AnalyticsPoint["granularity"];
  dimensions?: Record<string, string>;
};

export class AnalyticsMapper {
  toUnified(platform: SocialPlatformId, points: AnalyticsPoint[]): UnifiedSnapshot[] {
    return points.map((p) => ({ provider: platform, ...p }));
  }
}

// ---------------------------------------------------------------------------
// Webhook manager
// ---------------------------------------------------------------------------

export class WebhookManager {
  private subs = new Map<string, WebhookSubscription & { platform: SocialPlatformId; secret: string }>();
  constructor(private logger: Logger) {}

  async subscribe(platform: SocialPlatformId, ctx: AdapterContext, input: { event: string; callbackUrl: string; secret: string }) {
    const adapter = requireAdapter(platform);
    const sub = await adapter.subscribeWebhook(ctx, input);
    this.subs.set(sub.id, { ...sub, platform, secret: input.secret });
    this.logger.info("webhook.subscribed", { platform, event: sub.event });
    return sub;
  }

  /** Verify an inbound webhook using HMAC-SHA256 (timing-safe). */
  async verify(headers: Headers, rawBody: string, secret: string, headerName = "x-signature"): Promise<boolean> {
    const sig = headers.get(headerName);
    if (!sig) return false;
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const mac = await crypto.subtle.sign("HMAC", key, enc.encode(rawBody));
    const hex = [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, "0")).join("");
    return timingSafeEqualHex(hex, sig.replace(/^sha256=/, ""));
  }
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

// ---------------------------------------------------------------------------
// Publishing service
// ---------------------------------------------------------------------------

export class PublishingService {
  constructor(private store: SocialStore, private tokens: TokenManager, private logger: Logger) {}

  async publishOne(connectionId: string, input: PublishInput): Promise<PublishResult> {
    const conn = await this.store.getConnection(connectionId);
    if (!conn) throw new Error(`connection not found: ${connectionId}`);
    const adapter = requireAdapter(conn.platform);
    await this.tokens.ensureFresh(conn, adapter);
    const ctx = buildCtx(conn, this.store, this.logger);
    this.logger.info("publish.start", { platform: conn.platform, target: input.targetId });
    return adapter.publish(ctx, input);
  }

  async publishMany(items: { connectionId: string; input: PublishInput }[]): Promise<Array<{ connectionId: string; result?: PublishResult; error?: ClassifiedError }>> {
    return Promise.all(items.map(async ({ connectionId, input }) => {
      try { return { connectionId, result: await this.publishOne(connectionId, input) }; }
      catch (e) { return { connectionId, error: classifyError(e) }; }
    }));
  }
}

// ---------------------------------------------------------------------------
// Media upload service
// ---------------------------------------------------------------------------

export class MediaUploadService {
  constructor(private store: SocialStore, private tokens: TokenManager, private logger: Logger) {}

  async upload(connectionId: string, input: { url: string; kind: MediaAsset["kind"]; altText?: string }): Promise<MediaAsset> {
    const conn = await this.store.getConnection(connectionId);
    if (!conn) throw new Error(`connection not found: ${connectionId}`);
    const adapter = requireAdapter(conn.platform);
    await this.tokens.ensureFresh(conn, adapter);
    return adapter.uploadMedia(buildCtx(conn, this.store, this.logger), input);
  }
}

// ---------------------------------------------------------------------------
// Background sync service
// ---------------------------------------------------------------------------

export class BackgroundSyncService {
  constructor(
    private store: SocialStore,
    private tokens: TokenManager,
    private mapper: AnalyticsMapper,
    private logger: Logger,
  ) {}

  /** Sync one connection's analytics window; returns unified snapshots. */
  async syncAnalytics(connectionId: string, range: DateRange): Promise<UnifiedSnapshot[]> {
    const conn = await this.store.getConnection(connectionId);
    if (!conn) return [];
    const adapter = requireAdapter(conn.platform);
    if (!adapter.capabilities.has("analytics")) return [];
    try {
      await this.tokens.ensureFresh(conn, adapter);
      const points = await adapter.getAnalytics(buildCtx(conn, this.store, this.logger), range);
      const unified = this.mapper.toUnified(conn.platform, points);
      this.logger.info("sync.analytics.ok", { connectionId, count: unified.length });
      return unified;
    } catch (e) {
      this.logger.error("sync.analytics.fail", { connectionId, err: classifyError(e) });
      return [];
    }
  }

  async syncComments(connectionId: string, externalPostId: string, since?: string): Promise<Comment[]> {
    const conn = await this.store.getConnection(connectionId);
    if (!conn) return [];
    const adapter = requireAdapter(conn.platform);
    if (!adapter.capabilities.has("comments")) return [];
    await this.tokens.ensureFresh(conn, adapter);
    return adapter.listComments(buildCtx(conn, this.store, this.logger), { externalPostId, since });
  }

  /** Sweep every org connection — call from cron. */
  async sweep(orgId: string, range: DateRange): Promise<UnifiedSnapshot[]> {
    const conns = await this.store.listConnections(orgId);
    const all = await Promise.all(conns.map((c) => this.syncAnalytics(c.id, range)));
    return all.flat();
  }
}

// ---------------------------------------------------------------------------
// Integration manager (facade)
// ---------------------------------------------------------------------------

export class IntegrationManager {
  readonly oauth: OAuthConnectionManager;
  readonly tokens: TokenManager;
  readonly publishing: PublishingService;
  readonly media: MediaUploadService;
  readonly sync: BackgroundSyncService;
  readonly webhooks: WebhookManager;
  readonly mapper: AnalyticsMapper;
  readonly logger: Logger;

  constructor(private store: SocialStore, requestId?: string) {
    bootstrapSocialAdapters();
    this.logger = new Logger("social", requestId);
    this.mapper = new AnalyticsMapper();
    this.tokens = new TokenManager(store, this.logger.child("tokens"));
    this.oauth = new OAuthConnectionManager(store, this.logger.child("oauth"));
    this.publishing = new PublishingService(store, this.tokens, this.logger.child("publish"));
    this.media = new MediaUploadService(store, this.tokens, this.logger.child("media"));
    this.sync = new BackgroundSyncService(store, this.tokens, this.mapper, this.logger.child("sync"));
    this.webhooks = new WebhookManager(this.logger.child("webhooks"));
  }

  listPlatforms() {
    return listAdapters().map((a) => ({
      id: a.id, name: a.name, category: a.category, capabilities: [...a.capabilities],
    }));
  }

  supports(platform: SocialPlatformId, capability: Capability): boolean {
    return !!getAdapter(platform)?.capabilities.has(capability);
  }
}

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

function requireAdapter(id: SocialPlatformId): SocialAdapter {
  const a = getAdapter(id);
  if (!a) throw new Error(`no adapter registered for platform: ${id}`);
  return a;
}

function buildCtx(row: ConnectionRow, store: SocialStore, logger: Logger): AdapterContext {
  return {
    userId: row.userId, orgId: row.orgId, connectionId: row.id, tokens: row.tokens,
    persistTokens: (t) => store.updateTokens(row.id, t),
    fetch: createApiClient({ logger }),
    log: (event, data) => logger.info(event, data),
  };
}

function cryptoRandomId(): string {
  // Cloudflare Worker + Node both expose globalThis.crypto in the server runtime.
  return crypto.randomUUID();
}
