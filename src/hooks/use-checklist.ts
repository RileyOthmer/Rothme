import { useCallback, useEffect, useState } from "react";

/**
 * localStorage-backed checklist state.
 * Returns a Set of checked ids plus a toggle function.
 * SSR-safe: reads only on the client after mount.
 */
export function useChecklist(storageKey: string) {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const arr = JSON.parse(raw) as string[];
        setChecked(new Set(arr));
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, [storageKey]);

  const toggle = useCallback(
    (id: string) => {
      setChecked((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        try {
          window.localStorage.setItem(
            storageKey,
            JSON.stringify(Array.from(next)),
          );
        } catch {
          /* ignore */
        }
        return next;
      });
    },
    [storageKey],
  );

  return { checked, toggle, hydrated };
}
