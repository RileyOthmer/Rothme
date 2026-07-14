/** Supported social platforms surfaced across the Developer Center. */
export type DevPlatform = {
  id: string;
  name: string;
  mark: string;
  brandColor: string;
  category: "social" | "video" | "professional" | "messaging" | "presence";
  capabilities: ReadonlyArray<
    "publish" | "analytics" | "media" | "comments" | "messages" | "webhooks" | "stories" | "reels"
  >;
  apiVersion: string;
  /** Matches the `platform` value stored on social_connections. */
  connectionKey?: string;
};

export const DEV_PLATFORMS: readonly DevPlatform[] = [
  { id: "instagram", name: "Instagram",             mark: "IG", brandColor: "#E4405F", category: "social",       capabilities: ["publish","analytics","media","comments","stories","reels","webhooks"], apiVersion: "Graph v20", connectionKey: "instagram" },
  { id: "facebook",  name: "Facebook",              mark: "FB", brandColor: "#1877F2", category: "social",       capabilities: ["publish","analytics","media","comments","webhooks"],                       apiVersion: "Graph v20", connectionKey: "facebook" },
  { id: "threads",   name: "Threads",               mark: "TH", brandColor: "#000000", category: "social",       capabilities: ["publish","analytics"],                                                     apiVersion: "v1",         connectionKey: "threads" },
  { id: "tiktok",    name: "TikTok",                mark: "TK", brandColor: "#000000", category: "video",        capabilities: ["publish","analytics","media","comments","webhooks"],                       apiVersion: "v2",         connectionKey: "tiktok" },
  { id: "linkedin",  name: "LinkedIn",              mark: "LI", brandColor: "#0A66C2", category: "professional", capabilities: ["publish","analytics","media","comments","webhooks"],                       apiVersion: "v2",         connectionKey: "linkedin" },
  { id: "x",         name: "X",                     mark: "X",  brandColor: "#000000", category: "social",       capabilities: ["publish","analytics","media","webhooks"],                                  apiVersion: "v2",         connectionKey: "x" },
  { id: "youtube",   name: "YouTube",               mark: "YT", brandColor: "#FF0000", category: "video",        capabilities: ["publish","analytics","media","comments","webhooks"],                       apiVersion: "Data v3",    connectionKey: "youtube" },
  { id: "pinterest", name: "Pinterest",             mark: "PN", brandColor: "#E60023", category: "social",       capabilities: ["publish","analytics","media"],                                             apiVersion: "v5",         connectionKey: "pinterest" },
  { id: "gbp",       name: "Google Business Profile", mark: "GB", brandColor: "#4285F4", category: "presence",   capabilities: ["publish","analytics","comments","media"],                                  apiVersion: "v1",         connectionKey: "gbp" },
  { id: "bluesky",   name: "Bluesky",               mark: "BS", brandColor: "#0085FF", category: "social",       capabilities: ["publish","analytics","media"],                                             apiVersion: "AT proto",   connectionKey: "bluesky" },
  { id: "mastodon",  name: "Mastodon",              mark: "MS", brandColor: "#6364FF", category: "social",       capabilities: ["publish","analytics","media","comments"],                                  apiVersion: "v1",         connectionKey: "mastodon" },
  { id: "reddit",    name: "Reddit",                mark: "RD", brandColor: "#FF4500", category: "social",       capabilities: ["publish","analytics","comments"],                                          apiVersion: "v1" },
  { id: "discord",   name: "Discord",               mark: "DC", brandColor: "#5865F2", category: "messaging",    capabilities: ["publish","messages","webhooks"],                                           apiVersion: "v10" },
  { id: "slack",     name: "Slack",                 mark: "SL", brandColor: "#4A154B", category: "messaging",    capabilities: ["publish","messages","webhooks"],                                           apiVersion: "Web API" },
] as const;

export function findPlatform(id: string): DevPlatform | undefined {
  return DEV_PLATFORMS.find((p) => p.id === id);
}
