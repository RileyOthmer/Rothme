/**
 * OAuth 2.0 adapter framework — SERVER-ONLY.
 *
 * One generic adapter drives every platform via PlatformConfig. Platform-
 * specific quirks (profile parsers, auth header shape) live in small
 * overrides at the bottom of this file.
 *
 * Public surface (matches the "one service per platform" contract):
 *   getAdapter(platform).authorize({ userId, redirectUri })
 *                       .exchangeToken({ code, ... })
 *                       .refreshToken({ refreshToken })
 *                       .revokeToken({ accessToken })
 *                       .syncProfile({ accessToken })
 *                       .syncAnalytics({ accessToken })
 */
import { createHash, randomBytes } from "node:crypto";
import { resolvePlatformCredentials } from "@/lib/admin/credential-resolver.server";
import { getPlatform, type PlatformConfig, type PlatformId } from "./platforms";

export type TokenBundle = {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number; // seconds
  scope?: string;
  tokenType?: string;
  raw: Record<string, unknown>;
};

export type ProfileInfo = {
  platformAccountId: string;
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  raw: Record<string, unknown>;
};

export type AuthorizeArgs = { userId: string; redirectUri: string; state: string };
export type AuthorizeResult = { url: string; codeVerifier?: string };

export interface PlatformAdapter {
  readonly platform: PlatformId;
  readonly config: PlatformConfig;
  isConfigured(): boolean;
  authorize(args: AuthorizeArgs): Promise<AuthorizeResult>;
  exchangeToken(args: { code: string; redirectUri: string; codeVerifier?: string }): Promise<TokenBundle>;
  refreshToken(args: { refreshToken: string }): Promise<TokenBundle>;
  revokeToken(args: { accessToken: string }): Promise<void>;
  syncProfile(args: { accessToken: string }): Promise<ProfileInfo>;
  syncAnalytics(args: { accessToken: string; platformAccountId: string | null }): Promise<{ records: number }>;
}

// ---------- PKCE helpers ----------

function base64url(input: Buffer): string {
  return input.toString("base64").replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
}

export function generatePKCE(): { verifier: string; challenge: string } {
  const verifier = base64url(randomBytes(32));
  const challenge = base64url(createHash("sha256").update(verifier).digest());
  return { verifier, challenge };
}

// ---------- Generic adapter ----------

type ProfileFetcher = (accessToken: string) => Promise<ProfileInfo>;

async function readErr(res: Response): Promise<string> {
  const text = await res.text().catch(() => "");
  return `${res.status} ${res.statusText}${text ? ` — ${text.slice(0, 400)}` : ""}`;
}

function normalizeToken(json: Record<string, unknown>): TokenBundle {
  const accessToken = String(json.access_token ?? "");
  if (!accessToken) throw new Error("Provider returned no access_token");
  const refreshToken = json.refresh_token ? String(json.refresh_token) : undefined;
  const expiresIn = typeof json.expires_in === "number"
    ? json.expires_in
    : json.expires_in
      ? Number(json.expires_in)
      : undefined;
  return {
    accessToken,
    refreshToken,
    expiresIn: Number.isFinite(expiresIn) ? expiresIn : undefined,
    scope: json.scope ? String(json.scope) : undefined,
    tokenType: json.token_type ? String(json.token_type) : undefined,
    raw: json,
  };
}

class GenericAdapter implements PlatformAdapter {
  constructor(
    public readonly platform: PlatformId,
    public readonly config: PlatformConfig,
    private readonly profileFetcher: ProfileFetcher | null,
  ) {}

  isConfigured(): boolean {
    return Boolean(process.env[this.config.clientIdEnv] && process.env[this.config.clientSecretEnv]);
  }

  private async creds(): Promise<{ clientId: string; clientSecret: string }> {
    const r = await resolvePlatformCredentials(this.config.id);
    if (!r.clientId || !r.clientSecret) {
      throw new Error(`${this.config.name} is not configured (missing client credentials)`);
    }
    return { clientId: r.clientId, clientSecret: r.clientSecret };
  }

  async authorize({ redirectUri, state }: AuthorizeArgs): Promise<AuthorizeResult> {
    const { clientId } = await this.creds();
    const params = new URLSearchParams({
      client_id: clientId,
      response_type: "code",
      redirect_uri: redirectUri,
      state,
      scope: this.config.scopes.join(" "),
      ...(this.config.extraAuthorizeParams ?? {}),
    });
    let codeVerifier: string | undefined;
    if (this.config.usesPKCE) {
      const pkce = generatePKCE();
      codeVerifier = pkce.verifier;
      params.set("code_challenge", pkce.challenge);
      params.set("code_challenge_method", "S256");
    }
    return { url: `${this.config.authorizeUrl}?${params.toString()}`, codeVerifier };
  }

  async exchangeToken({ code, redirectUri, codeVerifier }: { code: string; redirectUri: string; codeVerifier?: string }): Promise<TokenBundle> {
    const { clientId, clientSecret } = await this.creds();
    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
    });
    if (codeVerifier) body.set("code_verifier", codeVerifier);
    const res = await fetch(this.config.tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
      body,
    });
    if (!res.ok) throw new Error(`Token exchange failed: ${await readErr(res)}`);
    return normalizeToken(await res.json());
  }

  async refreshToken({ refreshToken }: { refreshToken: string }): Promise<TokenBundle> {
    const { clientId, clientSecret } = await this.creds();
    const body = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    });
    const res = await fetch(this.config.tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
      body,
    });
    if (!res.ok) throw new Error(`Token refresh failed: ${await readErr(res)}`);
    return normalizeToken(await res.json());
  }

  async revokeToken({ accessToken }: { accessToken: string }): Promise<void> {
    if (!this.config.revokeUrl) return;
    const body = new URLSearchParams({ token: accessToken });
    await fetch(this.config.revokeUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
  }

  async syncProfile({ accessToken }: { accessToken: string }): Promise<ProfileInfo> {
    if (!this.profileFetcher) {
      // Safe default until a platform-specific fetcher is added.
      return { platformAccountId: "", username: null, displayName: null, avatarUrl: null, raw: {} };
    }
    return this.profileFetcher(accessToken);
  }

  async syncAnalytics(_args: { accessToken: string; platformAccountId: string | null }): Promise<{ records: number }> {
    // Analytics per platform is a large surface — wire real endpoints per
    // platform as data warehousing is built. For now we return a no-op result
    // so scheduled sync jobs succeed cleanly against placeholder adapters.
    return { records: 0 };
  }
}

// ---------- Platform-specific profile fetchers ----------
// Fill these in as each platform's OAuth app is registered. They are only
// invoked once a real access token exists, so unconfigured platforms are safe.

const PROFILE_FETCHERS: Partial<Record<PlatformId, ProfileFetcher>> = {
  facebook: async (token) => {
    const res = await fetch(`https://graph.facebook.com/v21.0/me?fields=id,name,picture&access_token=${encodeURIComponent(token)}`);
    if (!res.ok) throw new Error(`Facebook profile fetch failed: ${await readErr(res)}`);
    const j = (await res.json()) as { id: string; name?: string; picture?: { data?: { url?: string } } };
    return {
      platformAccountId: j.id,
      username: null,
      displayName: j.name ?? null,
      avatarUrl: j.picture?.data?.url ?? null,
      raw: j as Record<string, unknown>,
    };
  },
  linkedin: async (token) => {
    const res = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`LinkedIn profile fetch failed: ${await readErr(res)}`);
    const j = (await res.json()) as { sub: string; name?: string; email?: string; picture?: string };
    return {
      platformAccountId: j.sub,
      username: j.email ?? null,
      displayName: j.name ?? null,
      avatarUrl: j.picture ?? null,
      raw: j as Record<string, unknown>,
    };
  },
  x: async (token) => {
    const res = await fetch("https://api.twitter.com/2/users/me?user.fields=profile_image_url,name,username", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`X profile fetch failed: ${await readErr(res)}`);
    const j = (await res.json()) as { data?: { id: string; username?: string; name?: string; profile_image_url?: string } };
    const d = j.data ?? { id: "" };
    return {
      platformAccountId: d.id,
      username: d.username ?? null,
      displayName: d.name ?? null,
      avatarUrl: d.profile_image_url ?? null,
      raw: j as Record<string, unknown>,
    };
  },
};

// ---------- Registry ----------

export function getAdapter(platform: PlatformId | string): PlatformAdapter {
  const cfg = getPlatform(platform);
  if (!cfg) throw new Error(`Unknown platform: ${platform}`);
  return new GenericAdapter(cfg.id, cfg, PROFILE_FETCHERS[cfg.id] ?? null);
}

export function isPlatformConfigured(platform: PlatformId | string): boolean {
  const cfg = getPlatform(platform);
  if (!cfg) return false;
  return Boolean(process.env[cfg.clientIdEnv] && process.env[cfg.clientSecretEnv]);
}
