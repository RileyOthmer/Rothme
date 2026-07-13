// Client-safe JSON path helpers used by the mapper UI and the server tester.
import type { JsonLike } from "./types";

/**
 * Read a value from an unknown JSON object using a dotted / bracket path
 * such as `data.items[0].followers` or `analytics.followers`.
 */
export function readJsonPath(obj: unknown, path: string): JsonLike | undefined {
  if (!path) return undefined;
  const parts = path.split(/[.\[\]]/).filter(Boolean);
  let cur: any = obj;
  for (const p of parts) {
    if (cur == null) return undefined;
    cur = cur[p];
  }
  return cur as JsonLike;
}

export interface FlatLeaf {
  path: string;
  value: JsonLike;
  kind: "number" | "string" | "boolean" | "null" | "array" | "object";
}

/**
 * Walk a JSON value and return every leaf path with a preview value.
 * Arrays are indexed and truncated so mapping UI stays responsive.
 */
export function flattenJson(value: JsonLike, opts: { maxDepth?: number; maxItems?: number } = {}): FlatLeaf[] {
  const maxDepth = opts.maxDepth ?? 6;
  const maxItems = opts.maxItems ?? 25;
  const out: FlatLeaf[] = [];
  const walk = (v: JsonLike, path: string, depth: number) => {
    if (depth > maxDepth) return;
    if (v === null) { out.push({ path, value: null, kind: "null" }); return; }
    if (Array.isArray(v)) {
      out.push({ path, value: `Array(${v.length})` as any, kind: "array" });
      v.slice(0, maxItems).forEach((item, i) => walk(item as JsonLike, `${path}[${i}]`, depth + 1));
      return;
    }
    if (typeof v === "object") {
      if (path) out.push({ path, value: "{…}" as any, kind: "object" });
      for (const [k, child] of Object.entries(v)) {
        const next = path ? `${path}.${k}` : k;
        walk(child as JsonLike, next, depth + 1);
      }
      return;
    }
    const kind =
      typeof v === "number" ? "number"
      : typeof v === "boolean" ? "boolean"
      : "string";
    out.push({ path, value: v, kind });
  };
  walk(value, "", 0);
  return out.filter((l) => l.path.length > 0);
}
