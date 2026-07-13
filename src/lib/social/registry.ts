/**
 * Adapter registry — the ONLY place adapters are wired.
 *
 * Adding a platform: create `adapters/<id>.ts` exporting a factory, then
 * register it here. Everything else (OAuth manager, sync, publishing UI,
 * analytics mapper) picks it up automatically.
 */
import type { SocialAdapter, SocialPlatformId } from "./types";
import { createStubAdapter } from "./adapters/stub";

type Factory = () => SocialAdapter;

const REGISTRY = new Map<SocialPlatformId, Factory>();

export function registerAdapter(factory: Factory): void {
  const a = factory();
  REGISTRY.set(a.id, factory);
}

export function getAdapter(id: SocialPlatformId): SocialAdapter | undefined {
  const f = REGISTRY.get(id);
  return f ? f() : undefined;
}

export function listAdapters(): SocialAdapter[] {
  return [...REGISTRY.values()].map((f) => f());
}

/** Bootstrap — register all first-party adapters. Called once from server init. */
export function bootstrapSocialAdapters(): void {
  if (REGISTRY.size > 0) return;
  registerAdapter(() => createStubAdapter({ id: "instagram", name: "Instagram", category: "social" }));
  registerAdapter(() => createStubAdapter({ id: "facebook", name: "Facebook", category: "social" }));
  registerAdapter(() => createStubAdapter({ id: "threads", name: "Threads", category: "social" }));
  registerAdapter(() => createStubAdapter({ id: "tiktok", name: "TikTok", category: "video" }));
  registerAdapter(() => createStubAdapter({ id: "linkedin", name: "LinkedIn", category: "professional" }));
  registerAdapter(() => createStubAdapter({ id: "x", name: "X", category: "social" }));
  registerAdapter(() => createStubAdapter({ id: "youtube", name: "YouTube", category: "video" }));
  registerAdapter(() => createStubAdapter({ id: "pinterest", name: "Pinterest", category: "social" }));
  registerAdapter(() => createStubAdapter({ id: "bluesky", name: "Bluesky", category: "social" }));
  registerAdapter(() => createStubAdapter({ id: "mastodon", name: "Mastodon", category: "social" }));
  registerAdapter(() => createStubAdapter({ id: "gbp", name: "Google Business Profile", category: "presence" }));
}
