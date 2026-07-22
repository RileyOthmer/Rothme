import { useEffect, useState } from "react";

export type Theme = "light" | "dark" | "system";
export const THEME_STORAGE_KEY = "theme";

/**
 * Inline script content applied in the document <head> before body renders,
 * so the correct theme is set before first paint (no FOUC on SSR).
 * Reads localStorage then falls back to the OS preference.
 */
export const themeBootstrapScript = `
(function() {
  try {
    var stored = localStorage.getItem('${THEME_STORAGE_KEY}');
    var theme = stored || 'dark';
    var isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    var root = document.documentElement;
    root.classList.toggle('dark', isDark);
    root.style.colorScheme = isDark ? 'dark' : 'light';
  } catch (e) {}
})();
`.trim();

function applyTheme(theme: Theme) {
  if (typeof window === "undefined") return;
  const isDark =
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  const root = document.documentElement;
  root.classList.toggle("dark", isDark);
  root.style.colorScheme = isDark ? "dark" : "light";
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = (localStorage.getItem(THEME_STORAGE_KEY) as Theme | null) ?? "dark";
    setThemeState(stored);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => applyTheme("system");
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
  }, [theme, mounted]);

  const setTheme = (next: Theme) => {
    setThemeState(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      /* storage disabled */
    }
    applyTheme(next);
  };

  return { theme, setTheme, mounted };
}
