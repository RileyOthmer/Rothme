import type { UIMessage } from "ai";
import { useCallback, useEffect, useMemo, useState } from "react";

import { AssistantChat } from "@/components/assistant/AssistantChat";
import { StrategistMark } from "@/components/assistant/StrategistMark";
import { useAssistantPanel } from "@/hooks/use-assistant";
import {
  loadThreads,
  newThreadId,
  saveThreads,
  titleFromMessages,
  type AssistantThread,
} from "@/lib/assistant-store";

const PANEL_THREAD_PREFIX = "panel:";

function panelThreadId(key: string) {
  return `${PANEL_THREAD_PREFIX}${key}`;
}

export function AssistantPanel() {
  const { open, payload, close } = useAssistantPanel();
  const [threads, setThreads] = useState<AssistantThread[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setThreads(loadThreads());
    setHydrated(true);
  }, []);

  const threadKey = payload?.threadKey ?? "general";
  const threadId = panelThreadId(threadKey);

  const thread = useMemo(
    () => threads.find((t) => t.id === threadId),
    [threads, threadId],
  );

  const handleMessagesChange = useCallback(
    (messages: UIMessage[]) => {
      if (!hydrated) return;
      if (messages.length === 0) return;
      setThreads((prev) => {
        const rest = prev.filter((t) => t.id !== threadId);
        const existing = prev.find((t) => t.id === threadId);
        const next: AssistantThread = {
          id: threadId,
          title: existing?.title || titleFromMessages(messages),
          updatedAt: Date.now(),
          messages,
        };
        const updated = [next, ...rest];
        saveThreads(updated);
        return updated;
      });
    },
    [hydrated, threadId],
  );

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        aria-label="Close assistant"
        onClick={close}
        className="absolute inset-0 bg-foreground/20 backdrop-blur-[2px] transition-opacity"
      />
      <aside
        className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-border bg-background shadow-lg sm:max-w-lg"
        role="dialog"
        aria-label="Strategist"
      >
        <header className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2.5">
            <StrategistMark size={24} />
            <div>
              <div className="text-sm font-medium text-foreground">Strategist</div>
              <div className="text-[11px] text-muted-foreground">
                Plain English. Always with the why.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={close}
            className="rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-surface-2"
          >
            Close
          </button>
        </header>
        <div className="flex-1 min-h-0">
          {hydrated && (
            <AssistantChat
              key={threadId}
              threadId={threadId}
              initialMessages={thread?.messages ?? []}
              seedInput={payload?.seedMessage ?? ""}
              onMessagesChange={handleMessagesChange}
              compact
            />
          )}
        </div>
      </aside>
    </div>
  );
}
