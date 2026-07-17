import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import {
  CATEGORY_LABEL,
  type Notification,
  type NotificationCategory,
} from "@/lib/notifications-mock";
import {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  dismissNotification,
  type NotificationRow,
} from "@/lib/notifications/notifications.functions";

// -----------------------------------------------------------------------------
// Preferences (kept in localStorage — only affects UI filters, not delivery)
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
  onlyImportant: false,
  quietHours: { enabled: false, from: "21:00", to: "08:00" },
};

const PREFS_KEY = "ROTHME.notifications.prefs.v1";

function readPrefs(): NotificationPrefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return DEFAULT_PREFS;
    return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFS;
  }
}

function writePrefs(p: NotificationPrefs) {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

// -----------------------------------------------------------------------------
// Kind → category / label mapping
// -----------------------------------------------------------------------------

const KIND_CATEGORY: Record<string, NotificationCategory> = {
  "connection.success": "site",
  "connection.failed": "site",
  "publish.success": "campaign",
  "publish.failed": "campaign",
  "analytics.synced": "seo",
  "subscription.updated": "sales",
};

function toUiNotification(row: NotificationRow): Notification {
  const category = KIND_CATEGORY[row.kind] ?? "ai";
  return {
    id: row.id,
    title: row.title,
    what: row.body ?? "",
    why: "",
    action: "",
    impact: "",
    severity: row.severity,
    category,
    createdAt: row.created_at,
  };
}

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

const QUERY_KEY = ["notifications"] as const;

export function useNotifications() {
  const qc = useQueryClient();
  const listFn = useServerFn(listNotifications);
  const markReadFn = useServerFn(markNotificationRead);
  const markAllFn = useServerFn(markAllNotificationsRead);
  const dismissFn = useServerFn(dismissNotification);

  const { data: rows = [] } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => listFn(),
    staleTime: 30_000,
  });

  // Realtime — invalidate on any insert/update/delete for this user
  useEffect(() => {
    const channel = supabase
      .channel("notifications-feed")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications" },
        () => {
          qc.invalidateQueries({ queryKey: QUERY_KEY });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);

  // Prefs
  const [prefs, setPrefsState] = useState<NotificationPrefs>(DEFAULT_PREFS);
  useEffect(() => {
    setPrefsState(readPrefs());
  }, []);

  const notifications = useMemo(() => {
    return rows
      .map(toUiNotification)
      .filter((n) => {
        const pref = prefs.categories[n.category];
        if (!pref?.enabled) return false;
        if (prefs.onlyImportant && n.severity === "info") return false;
        return true;
      });
  }, [rows, prefs]);

  const unreadCount = useMemo(
    () => rows.filter((r) => r.status === "unread").length,
    [rows],
  );

  const isRead = useCallback(
    (id: string) => rows.find((r) => r.id === id)?.status !== "unread",
    [rows],
  );

  const markRead = useCallback(
    async (id: string) => {
      qc.setQueryData<NotificationRow[]>(QUERY_KEY, (prev) =>
        (prev ?? []).map((r) => (r.id === id ? { ...r, status: "read" } : r)),
      );
      try {
        await markReadFn({ data: { id } });
      } catch {
        qc.invalidateQueries({ queryKey: QUERY_KEY });
      }
    },
    [markReadFn, qc],
  );

  const markAllRead = useCallback(async () => {
    qc.setQueryData<NotificationRow[]>(QUERY_KEY, (prev) =>
      (prev ?? []).map((r) => ({ ...r, status: "read" })),
    );
    try {
      await markAllFn();
    } catch {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
    }
  }, [markAllFn, qc]);

  const dismiss = useCallback(
    async (id: string) => {
      qc.setQueryData<NotificationRow[]>(QUERY_KEY, (prev) =>
        (prev ?? []).filter((r) => r.id !== id),
      );
      try {
        await dismissFn({ data: { id } });
      } catch {
        qc.invalidateQueries({ queryKey: QUERY_KEY });
      }
    },
    [dismissFn, qc],
  );

  const setPrefs = useCallback(
    (updater: (prev: NotificationPrefs) => NotificationPrefs) => {
      setPrefsState((prev) => {
        const next = updater(prev);
        writePrefs(next);
        return next;
      });
    },
    [],
  );

  return {
    notifications,
    unreadCount,
    prefs,
    markRead,
    markAllRead,
    dismiss,
    setPrefs,
    isRead,
    categoryLabels: CATEGORY_LABEL,
  };
}
