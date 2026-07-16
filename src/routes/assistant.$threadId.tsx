import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import type { UIMessage } from "ai";
import { Pin, PinOff, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { AssistantChat } from "@/components/assistant/AssistantChat";
import { StrategistMark } from "@/components/assistant/StrategistMark";
import { Wordmark } from "@/components/brand/Wordmark";
import {
  loadThreads,
  newThreadId,
  saveThreads,
  sortThreads,
  titleFromMessages,
  type AssistantThread,
} from "@/lib/assistant-store";

export const Route = createFileRoute("/assistant/$threadId")({
  head: () => ({
    meta: [
      { title: "AI Strategist — ROTHME" },
      {
        name: "description",
        content:
          "Ask your senior marketing strategist anything. Plain English, always with the why and the evidence.",
      },
      { property: "og:title", content: "AI Strategist — ROTHME" },
      {
        property: "og:description",
        content: "Chat with your ROTHME AI strategist — plain-English marketing answers, always with the why.",
      },
    ],
  }),
  component: AssistantThreadPage,
});

function AssistantThreadPage() {
  const { threadId } = Route.useParams();
  const navigate = useNavigate();

  const [threads, setThreads] = useState<AssistantThread[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setThreads(loadThreads());
    setHydrated(true);
  }, []);

  const visibleThreads = useMemo(
    () => sortThreads(threads.filter((t) => !t.id.startsWith("panel:"))),
    [threads],
  );

  const thread = useMemo(
    () => threads.find((t) => t.id === threadId),
    [threads, threadId],
  );

  const handleMessagesChange = useCallback(
    (messages: UIMessage[]) => {
      if (!hydrated || messages.length === 0) return;
      setThreads((prev) => {
        const existing = prev.find((t) => t.id === threadId);
        const rest = prev.filter((t) => t.id !== threadId);
        const next: AssistantThread = {
          id: threadId,
          title: existing?.title || titleFromMessages(messages),
          updatedAt: Date.now(),
          messages,
          pinned: existing?.pinned ?? false,
        };
        const updated = [next, ...rest];
        saveThreads(updated);
        return updated;
      });
    },
    [hydrated, threadId],
  );

  const togglePin = (id: string) => {
    setThreads((prev) => {
      const updated = prev.map((t) =>
        t.id === id ? { ...t, pinned: !t.pinned } : t,
      );
      saveThreads(updated);
      return updated;
    });
  };


  const startNew = () => {
    const id = newThreadId();
    void navigate({ to: "/assistant/$threadId", params: { threadId: id } });
  };

  const removeThread = (id: string) => {
    setThreads((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      saveThreads(updated);
      if (id === threadId) {
        const nextId = updated.find((t) => !t.id.startsWith("panel:"))?.id;
        if (nextId) {
          void navigate({ to: "/assistant/$threadId", params: { threadId: nextId } });
        } else {
          const created = newThreadId();
          void navigate({ to: "/assistant/$threadId", params: { threadId: created } });
        }
      }
      return updated;
    });
  };

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <h1 className="sr-only">AI Strategist</h1>
      <header className="flex items-center justify-between border-b border-border bg-background/80 px-4 py-3 backdrop-blur-md sm:px-6">
        <div className="flex items-center gap-4">
          <Wordmark />
          <span className="hidden text-xs text-muted-foreground sm:inline">
            Strategist
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/dashboard"
            className="rounded-md px-3 py-1.5 text-xs text-muted-foreground hover:bg-surface-2 hover:text-foreground"
          >
            Dashboard
          </Link>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-surface-2/40 md:flex">
          <div className="p-3">
            <button
              type="button"
              onClick={startNew}
              className="flex w-full items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground shadow-xs transition-colors hover:bg-surface-2"
            >
              <Plus className="h-4 w-4" />
              New conversation
            </button>
          </div>
          <div className="eyebrow px-4 pb-2">Recent</div>
          <nav className="flex-1 overflow-y-auto px-2 pb-4">
            {visibleThreads.length === 0 && (
              <p className="px-3 py-2 text-xs text-muted-foreground">
                Nothing yet — ask your first question.
              </p>
            )}
            {visibleThreads.map((t) => {
              const active = t.id === threadId;
              return (
                <div
                  key={t.id}
                  className={
                    "group flex items-center gap-1 rounded-md px-1 " +
                    (active ? "bg-surface" : "")
                  }
                >
                  <Link
                    to="/assistant/$threadId"
                    params={{ threadId: t.id }}
                    className={
                      "flex-1 truncate rounded-md px-2 py-1.5 text-sm " +
                      (active
                        ? "font-medium text-foreground"
                        : "text-muted-foreground hover:text-foreground")
                    }
                  >
                    {t.pinned && (
                      <Pin className="mr-1 inline h-3 w-3 text-foreground/70" />
                    )}
                    {t.title}
                  </Link>
                  <button
                    type="button"
                    aria-label={t.pinned ? "Unpin conversation" : "Pin conversation"}
                    onClick={() => togglePin(t.id)}
                    className={
                      "grid h-7 w-7 place-items-center rounded-md text-muted-foreground transition-opacity hover:bg-surface-2 hover:text-foreground " +
                      (t.pinned ? "opacity-100" : "opacity-0 group-hover:opacity-100")
                    }
                  >
                    {t.pinned ? (
                      <PinOff className="h-3.5 w-3.5" />
                    ) : (
                      <Pin className="h-3.5 w-3.5" />
                    )}
                  </button>
                  <button
                    type="button"
                    aria-label="Delete conversation"
                    onClick={() => {
                      if (confirm("Delete this conversation?")) removeThread(t.id);
                    }}
                    className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground opacity-0 transition-opacity hover:bg-surface-2 hover:text-foreground group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </nav>
          <div className="border-t border-border px-4 py-3">
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <StrategistMark size={16} />
              Saved on this browser only.
            </div>
          </div>
        </aside>

        <main className="flex flex-1 min-h-0 flex-col">
          {hydrated ? (
            <AssistantChat
              key={threadId}
              threadId={threadId}
              initialMessages={thread?.messages ?? []}
              onMessagesChange={handleMessagesChange}
            />
          ) : null}
        </main>
      </div>
    </div>
  );
}
