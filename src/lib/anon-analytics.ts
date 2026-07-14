// Lightweight anonymous identifier + environment fingerprint for product
// analytics. No PII: we generate a random ID per browser and only capture
// coarse environment (timezone, device class, referrer host).

const ANON_KEY = "ROTHME.anon.v1";

export function getAnonId(): string {
  if (typeof window === "undefined") return "ssr-noop";
  try {
    let id = window.localStorage.getItem(ANON_KEY);
    if (!id) {
      id = crypto.randomUUID();
      window.localStorage.setItem(ANON_KEY, id);
    }
    return id;
  } catch {
    return "no-storage";
  }
}

export function getDeviceType(): "mobile" | "tablet" | "desktop" {
  if (typeof window === "undefined") return "desktop";
  const w = window.innerWidth;
  if (w < 640) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

export function getTimezone(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone ?? null;
  } catch {
    return null;
  }
}

export function getCountryFromLocale(): string | null {
  try {
    const parts = (navigator.language || "").split("-");
    const c = parts[1];
    return c && c.length === 2 ? c.toUpperCase() : null;
  } catch {
    return null;
  }
}

export function getReferralSource(): string | null {
  if (typeof document === "undefined") return null;
  try {
    const url = new URL(window.location.href);
    const utm = url.searchParams.get("utm_source");
    if (utm) return `utm:${utm.slice(0, 60)}`;
    const ref = document.referrer;
    if (!ref) return "direct";
    const host = new URL(ref).hostname;
    if (host === window.location.hostname) return "internal";
    return host.slice(0, 120);
  } catch {
    return null;
  }
}
