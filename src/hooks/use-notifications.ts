import { useCallback, useEffect, useState } from "react";
import {
  SEED_NOTIFICATIONS,
  type Notification,
  type NotificationCategory,
} from "@/lib/notifications-mock";

// -----------------------------------------------------------------------------
// Preferences
// -----------------------------------------------------------------------------

export type NotificationFrequency = "realtime" | "daily" | "weekly" | "off";
export type NotificationChannel = "inapp" | "email" | "push" | "slack" | "teams";

export type CategoryPref = {
  enabled: boolean;
  frequency: NotificationFrequency;
};

export type NotificationPrefs = {
  channels: Record<NotificationChannel, boolean>;
  categories: Record<NotificationCategory, CategoryPref>;
  onlyImportant: boolean;
  quietHours: { enabled: boolean; from: string; to: string };
};

export const DEFAULT_PREFS: NotificationPrefs = {
  channels: { inapp: true, email: false, push: false, slack: false, teams: false },
  categories: {
    sales: { enabled: true, frequency: "realtime" },
    ads: { enabled: true, frequency: "realtime" },
    campaign: { enabled: true, frequency: "daily" },
    seo: { enabled: true, frequency: "weekly" },
    site: { enabled: true, frequency: "realtime" },
    ai: { enabled: true, frequency: "daily" },
  },
  onlyImportant: true,
  quietHours: { enabled: true, from: "21:00", to: "08:00" },
};

// -----------------------------------------------------------------------------
// Persistence keys
// -----------------------------------------------------------------------------

const PREFS_KEY = "northstar.notifications.prefs.v1";
const READ_KEY = "northstar.notifications.read.v1";
const DISMISSED_KEY = "northstar.notifications.dismissed.v1";

// -----------------------------------------------------------------------------
// Shared subscription store — every consumer stays in sync
// -----------------------------------------------------------------------------

type State = {
  prefs: NotificationPrefs;
  read: string[];
  dismissed: string[];
};

let state: State = {
  prefs: DEFAULT_PREFS,
  read: [],
  dismissed: [],
};
let hydrated = false;
const listeners = new Set<() => void>();

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return { ...fallback, ...JSON.parse(raw) } as T;
  } catch {
    return fallback;
  }
}

function readArray(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  state = {
    prefs: readJSON<NotificationPrefs>(PREFS_KEY, DEFAULT_PREFS),
    read: readArray(READ_KEY),
    dismissed: readArray(DISMISSED_KEY),
  };
  hydrated = true;
}

function emit() {
  listeners.forEach((l) => l());
}

function persist() {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(state.prefs));
    localStorage.setItem(READ_KEY, JSON.stringify(state.read));
    localStorage.setItem(DISMISSED_KEY, JSON.stringify(state.dismissed));
  } catch {
    /* ignore quota errors */
  }
}

// -----------------------------------------------------------------------------
// Public hook
// -----------------------------------------------------------------------------

export function useNotifications() {
  const [, setTick] = useState(0);

  // Hydrate once on the client, then subscribe for cross-component updates.
  useEffect(() => {
    hydrate();
    const l = () => setTick((n) => n + 1);
    listeners.add(l);
    l();
    return () => {
      listeners.delete(l);
    };
  }, []);

  const notifications = SEED_NOTIFICATIONS.filter((n) => {
    if (state.dismissed.includes(n.id)) return false;
    const pref = state.prefs.categories[n.category];
    if (!pref?.enabled) return false;
    if (state.prefs.onlyImportant && n.severity === "info") return false;
    return true;
  });

  const unreadCount = notifications.filter((n) => !state.read.includes(n.id)).length;

  const markRead = useCallback((id: string) => {
    if (state.read.includes(id)) return;
    state = { ...state, read: [...state.read, id] };
    persist();
    emit();
  }, []);

  const markAllRead = useCallback(() => {
    state = { ...state, read: SEED_NOTIFICATIONS.map((n) => n.id) };
    persist();
    emit();
  }, []);

  const dismiss = useCallback((id: string) => {
    state = { ...state, dismissed: [...state.dismissed, id] };
    persist();
    emit();
  }, []);

  const setPrefs = useCallback(
    (updater: (prev: NotificationPrefs) => NotificationPrefs) => {
      state = { ...state, prefs: updater(state.prefs) };
      persist();
      emit();
    },
    [],
  );

  const isRead = useCallback((id: string) => state.read.includes(id), []);

  return {
    notifications,
    unreadCount,
    prefs: state.prefs,
    markRead,
    markAllRead,
    dismiss,
    setPrefs,
    isRead,
  };
}
