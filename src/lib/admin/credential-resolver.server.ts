/**
 * DB-first, env-fallback resolver for social platform OAuth credentials.
 * Server-only.
 */
import { decryptJson } from "@/lib/integrations/crypto.server";
import { getPlatform, type PlatformId } from "@/lib/social-connections/platforms";

type Cached = { at: number; value: { clientId?: string; clientSecret?: string } };
const CACHE = new Map<string, Cached>();
const TTL_MS = 30_000;

export type ResolvedCredentials = {
  clientId?: string;
  clientSecret?: string;
  source: "db" | "env" | "none";
};

async function loadFromDb(platformId: string): Promise<{ clientId?: string; clientSecret?: string } | null> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("admin_credentials" as never)
    .select("client_id_ciphertext, client_secret_ciphertext")
    .eq("platform_id", platformId)
    .maybeSingle();
  if (error || !data) return null;
  const row = data as { client_id_ciphertext: string | null; client_secret_ciphertext: string | null };
  const out: { clientId?: string; clientSecret?: string } = {};
  try {
    if (row.client_id_ciphertext) {
      const v = decryptJson<{ v: string }>(row.client_id_ciphertext);
      if (v?.v) out.clientId = v.v;
    }
    if (row.client_secret_ciphertext) {
      const v = decryptJson<{ v: string }>(row.client_secret_ciphertext);
      if (v?.v) out.clientSecret = v.v;
    }
  } catch {
    return null;
  }
  return out;
}

export async function resolvePlatformCredentials(platformId: PlatformId | string): Promise<ResolvedCredentials> {
  const cfg = getPlatform(platformId);
  if (!cfg) return { source: "none" };

  const cached = CACHE.get(cfg.id);
  if (cached && Date.now() - cached.at < TTL_MS) {
    if (cached.value.clientId && cached.value.clientSecret) {
      return { ...cached.value, source: "db" };
    }
  }

  const db = await loadFromDb(cfg.id).catch(() => null);
  if (db?.clientId && db?.clientSecret) {
    CACHE.set(cfg.id, { at: Date.now(), value: db });
    return { ...db, source: "db" };
  }

  const envId = process.env[cfg.clientIdEnv];
  const envSecret = process.env[cfg.clientSecretEnv];
  if (envId && envSecret) {
    return { clientId: envId, clientSecret: envSecret, source: "env" };
  }
  return { source: "none" };
}

export function invalidateCredentialCache(platformId?: string) {
  if (platformId) CACHE.delete(platformId);
  else CACHE.clear();
}
