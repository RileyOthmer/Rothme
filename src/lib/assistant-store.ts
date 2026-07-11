import type { UIMessage } from "ai";

const STORAGE_KEY = "velora.assistant.threads.v1";

export type AssistantThread = {
  id: string;
  title: string;
  updatedAt: number;
  messages: UIMessage[];
  pinned?: boolean;
};

function isBrowser() {
  return typeof window !== "undefined";
}

export function loadThreads(): AssistantThread[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AssistantThread[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function saveThreads(threads: AssistantThread[]) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
  } catch {
    // storage full or blocked — silently ignore
  }
}

export function newThreadId(): string {
  return `t_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

export function titleFromMessages(messages: UIMessage[]): string {
  const firstUser = messages.find((m) => m.role === "user");
  if (!firstUser) return "New conversation";
  const text = firstUser.parts
    .map((p) => (p.type === "text" ? p.text : ""))
    .join(" ")
    .trim();
  if (!text) return "New conversation";
  const words = text.split(/\s+/).slice(0, 7).join(" ");
  return words.length < text.length ? `${words}…` : words;
}

/** Sort: pinned first (by updatedAt desc), then rest (by updatedAt desc). */
export function sortThreads(threads: AssistantThread[]): AssistantThread[] {
  return [...threads].sort((a, b) => {
    if (!!b.pinned !== !!a.pinned) return b.pinned ? 1 : -1;
    return b.updatedAt - a.updatedAt;
  });
}
