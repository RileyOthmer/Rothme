/**
 * Singleton IntegrationManager bound to the Supabase-backed store.
 * SERVER-ONLY.
 */
import { IntegrationManager } from "./framework.server";
import { createSupabaseSocialStore } from "./store.server";

let cached: IntegrationManager | null = null;

export async function getIntegrationManager(): Promise<IntegrationManager> {
  if (cached) return cached;
  cached = new IntegrationManager(createSupabaseSocialStore());
  return cached;
}
