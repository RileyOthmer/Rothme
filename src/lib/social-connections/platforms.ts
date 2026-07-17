/**
 * Social platform registry — the ONE place platform metadata lives.
 * Adding a new platform means adding an entry here and (optionally) a custom
 * profile parser. No UI changes, no schema changes.
 *
 * Client-safe: no secrets, no server imports. Env-var *names* only.
 */

export type PlatformId =
  | "facebook"
  | "instagram"
  | "threads"
  | "linkedin"
  | "x"
  | "tiktok"
  | "youtube"
  | "pinterest"
  | "gbp"
  | "reddit"
  | "bluesky"
  | "google_ads";

export type PlatformConfig = {
  id: PlatformId;
  name: string;
  category: "social" | "video" | "professional" | "presence" | "ads";
  brandColor: string;
  /** Two-letter mark shown inside the logo tile. */
  mark: string;
  /** OAuth 2.0 authorize endpoint. */
  authorizeUrl: string;
  /** OAuth 2.0 token endpoint. */
  tokenUrl: string;
  /** Optional token revocation endpoint. */
  revokeUrl?: string;
  /** Scopes requested during authorize. */
  scopes: string[];
  /** Env var name for OAuth client ID (server-only). */
  clientIdEnv: string;
  /** Env var name for OAuth client secret (server-only). */
  clientSecretEnv: string;
  /** Whether to use PKCE (S256) — X, Twitter, TikTok, Reddit, etc. */
  usesPKCE: boolean;
  /** Provider docs URL surfaced in the "awaiting credentials" state. */
  docsUrl: string;
  /** Extra query params to append to the authorize URL. */
  extraAuthorizeParams?: Record<string, string>;
  /** One-line description shown in the UI. */
  blurb: string;
  /**
   * MVP availability. "available" platforms are fully wired and shown with
   * Connect / Refresh / Disconnect controls. "coming_soon" platforms are
   * listed for transparency but never expose a Connect button — flip to
   * "available" once the adapter and provider credentials are ready.
   */
  availability: "available" | "coming_soon";
};

export const PLATFORMS: PlatformConfig[] = [
  {
    id: "facebook",
    availability: "available",
    name: "Facebook",
    category: "social",
    brandColor: "#1877F2",
    mark: "FB",
    authorizeUrl: "https://www.facebook.com/v24.0/dialog/oauth",
    tokenUrl: "https://graph.facebook.com/v24.0/oauth/access_token",
    scopes: ["pages_show_list", "pages_read_engagement", "pages_manage_posts", "read_insights"],
    clientIdEnv: "FACEBOOK_CLIENT_ID",
    clientSecretEnv: "FACEBOOK_CLIENT_SECRET",
    usesPKCE: false,
    docsUrl: "https://developers.facebook.com/docs/facebook-login/",
    blurb: "Pages, posts, insights, and audience reach.",
  },
  {
    id: "instagram",
    availability: "available",
    name: "Instagram",
    category: "social",
    brandColor: "#E4405F",
    mark: "IG",
    authorizeUrl: "https://www.facebook.com/v24.0/dialog/oauth",
    tokenUrl: "https://graph.facebook.com/v24.0/oauth/access_token",
    scopes: ["instagram_basic", "instagram_manage_insights", "pages_show_list"],
    clientIdEnv: "INSTAGRAM_CLIENT_ID",
    clientSecretEnv: "INSTAGRAM_CLIENT_SECRET",
    usesPKCE: false,
    docsUrl: "https://developers.facebook.com/docs/instagram-api/",
    blurb: "Posts, stories, reels, and engagement.",
  },
  {
    id: "threads",
    availability: "coming_soon",
    name: "Threads",
    category: "social",
    brandColor: "#000000",
    mark: "TH",
    authorizeUrl: "https://threads.net/oauth/authorize",
    tokenUrl: "https://graph.threads.net/oauth/access_token",
    scopes: ["threads_basic", "threads_content_publish", "threads_manage_insights"],
    clientIdEnv: "THREADS_CLIENT_ID",
    clientSecretEnv: "THREADS_CLIENT_SECRET",
    usesPKCE: false,
    docsUrl: "https://developers.facebook.com/docs/threads/",
    blurb: "Threads posts and reply activity.",
  },
  {
    id: "linkedin",
    availability: "available",
    name: "LinkedIn",
    category: "professional",
    brandColor: "#0A66C2",
    mark: "IN",
    authorizeUrl: "https://www.linkedin.com/oauth/v2/authorization",
    tokenUrl: "https://www.linkedin.com/oauth/v2/accessToken",
    scopes: ["openid", "profile", "email", "w_member_social", "r_organization_social"],
    clientIdEnv: "LINKEDIN_CLIENT_ID",
    clientSecretEnv: "LINKEDIN_CLIENT_SECRET",
    usesPKCE: false,
    docsUrl: "https://learn.microsoft.com/en-us/linkedin/",
    blurb: "Company page updates and professional reach.",
  },
  {
    id: "x",
    availability: "coming_soon",
    name: "X",
    category: "social",
    brandColor: "#000000",
    mark: "X",
    authorizeUrl: "https://twitter.com/i/oauth2/authorize",
    tokenUrl: "https://api.twitter.com/2/oauth2/token",
    revokeUrl: "https://api.twitter.com/2/oauth2/revoke",
    scopes: ["tweet.read", "tweet.write", "users.read", "offline.access"],
    clientIdEnv: "X_CLIENT_ID",
    clientSecretEnv: "X_CLIENT_SECRET",
    usesPKCE: true,
    docsUrl: "https://developer.x.com/en/docs/authentication/oauth-2-0",
    blurb: "Post, read, and measure X (Twitter) activity.",
  },
  {
    id: "tiktok",
    availability: "available",
    name: "TikTok",
    category: "video",
    brandColor: "#010101",
    mark: "TT",
    authorizeUrl: "https://www.tiktok.com/v2/auth/authorize/",
    tokenUrl: "https://open.tiktokapis.com/v2/oauth/token/",
    revokeUrl: "https://open.tiktokapis.com/v2/oauth/revoke/",
    scopes: ["user.info.basic", "video.list", "video.publish"],
    clientIdEnv: "TIKTOK_CLIENT_ID",
    clientSecretEnv: "TIKTOK_CLIENT_SECRET",
    usesPKCE: true,
    docsUrl: "https://developers.tiktok.com/doc/oauth-user-access-token-management",
    blurb: "Videos, publishing, and creator analytics.",
  },
  {
    id: "youtube",
    availability: "available",
    name: "YouTube",
    category: "video",
    brandColor: "#FF0000",
    mark: "YT",
    authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    revokeUrl: "https://oauth2.googleapis.com/revoke",
    scopes: [
      "https://www.googleapis.com/auth/youtube.readonly",
      "https://www.googleapis.com/auth/youtube.upload",
      "https://www.googleapis.com/auth/yt-analytics.readonly",
    ],
    clientIdEnv: "YOUTUBE_CLIENT_ID",
    clientSecretEnv: "YOUTUBE_CLIENT_SECRET",
    usesPKCE: false,
    docsUrl: "https://developers.google.com/youtube/v3/guides/authentication",
    extraAuthorizeParams: { access_type: "offline", prompt: "consent" },
    blurb: "Channel, video, and viewership analytics.",
  },
  {
    id: "pinterest",
    availability: "coming_soon",
    name: "Pinterest",
    category: "social",
    brandColor: "#E60023",
    mark: "PI",
    authorizeUrl: "https://www.pinterest.com/oauth/",
    tokenUrl: "https://api.pinterest.com/v5/oauth/token",
    scopes: ["boards:read", "pins:read", "pins:write", "user_accounts:read"],
    clientIdEnv: "PINTEREST_CLIENT_ID",
    clientSecretEnv: "PINTEREST_CLIENT_SECRET",
    usesPKCE: true,
    docsUrl: "https://developers.pinterest.com/docs/getting-started/authentication/",
    blurb: "Pins, boards, and audience insights.",
  },
  {
    id: "gbp",
    availability: "available",
    name: "Google Business Profile",
    category: "presence",
    brandColor: "#4285F4",
    mark: "GB",
    authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    revokeUrl: "https://oauth2.googleapis.com/revoke",
    scopes: ["https://www.googleapis.com/auth/business.manage"],
    clientIdEnv: "GBP_CLIENT_ID",
    clientSecretEnv: "GBP_CLIENT_SECRET",
    usesPKCE: false,
    docsUrl: "https://developers.google.com/my-business/content/basic-setup",
    extraAuthorizeParams: { access_type: "offline", prompt: "consent" },
    blurb: "Reviews, posts, and local listing performance.",
  },
  {
    id: "reddit",
    availability: "coming_soon",
    name: "Reddit",
    category: "social",
    brandColor: "#FF4500",
    mark: "RE",
    authorizeUrl: "https://www.reddit.com/api/v1/authorize",
    tokenUrl: "https://www.reddit.com/api/v1/access_token",
    revokeUrl: "https://www.reddit.com/api/v1/revoke_token",
    scopes: ["identity", "submit", "read", "history"],
    clientIdEnv: "REDDIT_CLIENT_ID",
    clientSecretEnv: "REDDIT_CLIENT_SECRET",
    usesPKCE: false,
    docsUrl: "https://github.com/reddit-archive/reddit/wiki/OAuth2",
    extraAuthorizeParams: { duration: "permanent" },
    blurb: "Subreddits, posts, and community activity.",
  },
  {
    id: "bluesky",
    availability: "coming_soon",
    name: "Bluesky",
    category: "social",
    brandColor: "#0085FF",
    mark: "BS",
    // Bluesky uses AT Protocol OAuth (per-PDS discovery). We keep the entry
    // point on bsky.social and let the adapter handle the OAuth metadata dance
    // once credentials are configured. Until then this remains a placeholder.
    authorizeUrl: "https://bsky.social/oauth/authorize",
    tokenUrl: "https://bsky.social/oauth/token",
    scopes: ["atproto", "transition:generic"],
    clientIdEnv: "BLUESKY_CLIENT_ID",
    clientSecretEnv: "BLUESKY_CLIENT_SECRET",
    usesPKCE: true,
    docsUrl: "https://docs.bsky.app/docs/advanced-guides/oauth-client",
    blurb: "Posts and follower activity on the AT Protocol.",
  {
    id: "google_ads",
    availability: "available",
    name: "Google Ads",
    category: "ads",
    brandColor: "#4285F4",
    mark: "GA",
    authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    revokeUrl: "https://oauth2.googleapis.com/revoke",
    scopes: ["https://www.googleapis.com/auth/adwords"],
    clientIdEnv: "GOOGLE_ADS_CLIENT_ID",
    clientSecretEnv: "GOOGLE_ADS_CLIENT_SECRET",
    usesPKCE: false,
    docsUrl: "https://developers.google.com/google-ads/api/docs/oauth/overview",
    extraAuthorizeParams: { access_type: "offline", prompt: "consent", include_granted_scopes: "true" },
    blurb: "Search, display, and performance campaign results.",
  },
];

export const PLATFORM_BY_ID: Record<PlatformId, PlatformConfig> = Object.fromEntries(
  PLATFORMS.map((p) => [p.id, p]),
) as Record<PlatformId, PlatformConfig>;

export function getPlatform(id: string): PlatformConfig | undefined {
  return PLATFORM_BY_ID[id as PlatformId];
}
