import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { GlobalSearchDialog } from "./GlobalSearchDialog";

/**
 * Floating global-search launcher. Opens on click, Cmd/Ctrl+/, or "/".
 * Kept out of Cmd+K so the AI Command Bar keeps that shortcut.
 */
export function GlobalSearchLauncher() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);
      if ((e.metaKey || e.ctrlKey) && e.key === "/") {
        e.preventDefault();
        setOpen((o) => !o);
        return;
      }
      if (e.key === "/" && !typing) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search"
        className="fixed right-4 top-3 z-30 hidden items-center gap-2 rounded-md border border-border bg-surface/80 px-2.5 py-1.5 text-xs font-medium text-muted-foreground shadow-xs backdrop-blur transition-colors hover:bg-surface md:inline-flex"
      >
        <Search className="h-3.5 w-3.5" />
        <span>Search</span>
        <kbd className="ml-1 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
          /
        </kbd>
      </button>
      <GlobalSearchDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
