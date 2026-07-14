import type { Goal } from "./types";
import { getSeedGoals } from "./seed";

const STORAGE_KEY = "ROTHME.goals.v1";

function safeParse(raw: string | null): Goal[] | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed as Goal[];
  } catch {
    return null;
  }
}

export function loadGoals(): Goal[] {
  if (typeof window === "undefined") return [];
  const existing = safeParse(window.localStorage.getItem(STORAGE_KEY));
  if (existing) return existing;
  const seed = getSeedGoals();
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  return seed;
}

export function saveGoals(goals: Goal[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
}

export function newGoalId(): string {
  return `g_${Math.random().toString(36).slice(2, 10)}`;
}
