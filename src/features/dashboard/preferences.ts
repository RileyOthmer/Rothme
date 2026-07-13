// Dashboard personalization derived from onboarding answers.
// Written to localStorage on onboarding finish and consumed by the dashboard
// to prioritize widgets. No PII stored — just intent tags.

export type WidgetId =
  | "analytics"
  | "ai"
  | "scheduling"
  | "inbox"
  | "accounts"
  | "collab";

export type DashboardPrefs = {
  priority: WidgetId[]; // ordered, primary first
  updatedAt: string;
};

const PREFS_KEY = "velora.dashboard.prefs.v1";

// Signals from the onboarding form we care about.
export type IntentSignals = {
  goals?: string[];
  aiFeatures?: string[];
  frustrations?: string[];
  platforms?: string[];
};

const ALL_WIDGETS: WidgetId[] = [
  "analytics",
  "ai",
  "scheduling",
  "inbox",
  "accounts",
  "collab",
];

// Map onboarding answer strings → widget → weight.
function scoreWidgets(s: IntentSignals): Record<WidgetId, number> {
  const score: Record<WidgetId, number> = {
    analytics: 0, ai: 0, scheduling: 0, inbox: 0, accounts: 0, collab: 0,
  };
  const has = (arr: string[] | undefined, needle: string) =>
    !!arr?.some((v) => v.toLowerCase().includes(needle));

  // Analytics
  if (has(s.goals, "analytics") || has(s.goals, "track")) score.analytics += 3;
  if (has(s.frustrations, "analytics") || has(s.frustrations, "reporting")) score.analytics += 2;
  if (has(s.aiFeatures, "performance insights")) score.analytics += 1;

  // AI
  if (has(s.aiFeatures, "everything")) score.ai += 4;
  if ((s.aiFeatures?.length ?? 0) > 0) score.ai += 2;
  if (has(s.goals, "ai content") || has(s.goals, "create ai")) score.ai += 3;
  if (has(s.frustrations, "content") || has(s.frustrations, "ideas")) score.ai += 1;

  // Scheduling
  if (has(s.goals, "schedule")) score.scheduling += 4;
  if (has(s.frustrations, "scheduling")) score.scheduling += 2;
  if (has(s.aiFeatures, "content calendar")) score.scheduling += 1;

  // Inbox / engagement
  if (has(s.goals, "engagement") || has(s.goals, "reply")) score.inbox += 3;
  if (has(s.frustrations, "engagement")) score.inbox += 2;
  if (has(s.aiFeatures, "auto replies")) score.inbox += 2;

  // Multiple accounts
  if (has(s.goals, "multiple accounts") || has(s.goals, "manage multiple")) score.accounts += 4;
  if (has(s.frustrations, "multiple apps")) score.accounts += 2;
  if ((s.platforms?.length ?? 0) >= 3) score.accounts += 1;

  // Collaboration
  if (has(s.goals, "collaborate") || has(s.goals, "team")) score.collab += 4;
  if (has(s.frustrations, "team") || has(s.frustrations, "collab")) score.collab += 2;

  return score;
}

export function computePriority(s: IntentSignals): WidgetId[] {
  const score = scoreWidgets(s);
  return [...ALL_WIDGETS].sort((a, b) => score[b] - score[a]);
}

export function saveDashboardPrefs(s: IntentSignals) {
  if (typeof window === "undefined") return;
  const prefs: DashboardPrefs = {
    priority: computePriority(s),
    updatedAt: new Date().toISOString(),
  };
  try {
    window.localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    /* ignore */
  }
}

export function loadDashboardPrefs(): DashboardPrefs | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PREFS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DashboardPrefs;
    if (!Array.isArray(parsed.priority)) return null;
    return parsed;
  } catch {
    return null;
  }
}
