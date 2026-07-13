// Server-only AES-256-GCM helpers for integration credential storage.
// Uses INTEGRATION_ENCRYPTION_KEY provisioned as a project secret.
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

function key(): Buffer {
  const raw = process.env.INTEGRATION_ENCRYPTION_KEY;
  if (!raw) throw new Error("INTEGRATION_ENCRYPTION_KEY is not set");
  // Derive a 32-byte key regardless of input length.
  return createHash("sha256").update(raw, "utf8").digest();
}

export function encryptJson(value: unknown): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const plaintext = Buffer.from(JSON.stringify(value ?? {}), "utf8");
  const ct = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), ct]).toString("base64");
}

export function decryptJson<T = Record<string, string>>(stored: string | null | undefined): T {
  if (!stored) return {} as T;
  const buf = Buffer.from(stored, "base64");
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const ct = buf.subarray(28);
  const decipher = createDecipheriv("aes-256-gcm", key(), iv);
  decipher.setAuthTag(tag);
  const pt = Buffer.concat([decipher.update(ct), decipher.final()]).toString("utf8");
  return JSON.parse(pt) as T;
}

// Mask a value for admin display: keep last 4 chars, replace rest with •.
export function maskSecret(v: string | undefined | null): string {
  if (!v) return "";
  if (v.length <= 6) return "••••";
  return "•".repeat(Math.max(4, v.length - 4)) + v.slice(-4);
}
