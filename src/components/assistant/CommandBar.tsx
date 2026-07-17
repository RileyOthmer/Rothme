import { useChat } from "@ai-sdk/react";
import { useLocation } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { DefaultChatTransport, type UIMessage } from "ai";
import {
  ArrowUp,
  ChevronDown,
  Command,
  FileText,
  Loader2,
  Square,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { AssistantMessage, messageText } from "./AssistantMessage";
import { ASK_AI_EVENT, type AskAIPayload } from "./quick-actions";
import { savePost } from "@/lib/publishing/publishing.functions";

const EXAMPLES = [
  "Create a week's worth of Instagram posts",
  "Write a Facebook advertisement",
  "Create a Google Business update",
  "Generate YouTube video ideas",
  "Create TikTok captions",
  "Rewrite this marketing copy",
  "Plan next week's content",
];

const PLACEHOLDER = "Ask your AI Marketing Assistant anything…";

/**
 * Global AI Command Bar
 * Persistent bar anchored to the bottom of every authenticated page.
 * - Multiline input, Cmd/Ctrl+K focus, Enter to send, Shift+Enter newline, Esc closes.
 * - Streams responses inline, cancellable mid-generation.
 * - Offers "Save as draft" after completion — never publishes automatically.
 */
export function CommandBar() {
  const location = useLocation();

  // Hide on the full-page assistant + auth pages to avoid duplication.
  const hidden = useMemo(() => {
    const p = location.pathname;
    return p.startsWith("/assistant") || p.startsWith("/auth") || p.startsWith("/lovable");
  }, [location.pathname]);

  const [input, setInput] = useState("");
  const [expanded, setExpanded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Record<string, boolean>>({});

  const saveDraftFn = useServerFn(savePost);

  const { messages, sendMessage, status, stop, setMessages, error } = useChat({
    id: "command-bar",
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const isLoading = status === "submitted" || status === "streaming";

  // Cmd/Ctrl+K focuses the bar globally.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        textareaRef.current?.focus();
        setExpanded(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Auto-grow textarea.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [input]);

  // Auto-scroll transcript.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, status]);

  // Auto-expand when a message exists.
  useEffect(() => {
    if (messages.length > 0) setExpanded(true);
  }, [messages.length]);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    setInput("");
    setExpanded(true);
    void sendMessage({ text: trimmed });
  };

  // Quick Actions (or any other surface) can dispatch `askAI` to preconfigure
  // this bar with a task-specific prompt. Same generation engine, no dupes.
  useEffect(() => {
    const onAsk = (e: Event) => {
      const detail = (e as CustomEvent<AskAIPayload>).detail;
      if (!detail?.prompt) return;
      setExpanded(true);
      textareaRef.current?.focus();
      // If a stream is running, don't stomp on it — surface a light toast.
      if (isLoading) {
        toast.info("Rothme AI is still working — try again in a moment.");
        return;
      }
      void sendMessage({ text: detail.prompt });
    };
    window.addEventListener(ASK_AI_EVENT, onAsk);
    return () => window.removeEventListener(ASK_AI_EVENT, onAsk);
  }, [isLoading, sendMessage]);

  const clear = () => {
    if (isLoading) stop();
    setMessages([]);
    setSavedIds({});
    setExpanded(false);
    setInput("");
  };

  const handleSaveDraft = async (message: UIMessage) => {
    const body = messageText(message).trim();
    if (!body) return;
    setSavingId(message.id);
    try {
      // Derive a title from the last user prompt or the first line of output.
      const lastUser = [...messages]
        .reverse()
        .find((m) => m.role === "user");
      const title =
        (lastUser ? messageText(lastUser) : body.split("\n")[0])
          .replace(/^#+\s*/, "")
          .slice(0, 120) || null;
      await saveDraftFn({
        data: {
          title,
          body,
          status: "draft",
          tags: ["ai"],
          variants: [],
          schedules: [],
        },
      });
      setSavedIds((s) => ({ ...s, [message.id]: true }));
      toast.success("Saved to Drafts — review it in Publishing before it goes live.");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not save draft.";
      toast.error(msg);
    } finally {
      setSavingId(null);
    }
  };

  if (hidden) return null;

  return (
    <div className="pointer-events-none fixed right-3 bottom-3 z-40 flex justify-end sm:right-6 sm:bottom-4">
      <div className="pointer-events-auto w-80 max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-2xl border border-border bg-background/95 shadow-2xl shadow-black/30 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:w-96">
        {/* Transcript panel */}
        {expanded && messages.length > 0 && (
          <div className="border-b border-border">
            <div className="flex items-center justify-between border-b border-border/60 px-4 py-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5" />
                <span>AI Marketing Assistant</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={clear}
                  className="rounded px-2 py-1 text-[11px] hover:bg-surface-2"
                >
                  New
                </button>
                <button
                  type="button"
                  onClick={() => setExpanded(false)}
                  aria-label="Collapse"
                  className="grid h-6 w-6 place-items-center rounded hover:bg-surface-2"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <div
              ref={scrollRef}
              className="max-h-[50vh] space-y-5 overflow-y-auto px-4 py-4"
            >
              {messages.map((m) => (
                <MessageRow
                  key={m.id}
                  message={m}
                  onSaveDraft={handleSaveDraft}
                  saving={savingId === m.id}
                  saved={!!savedIds[m.id]}
                  canSave={!isLoading}
                />
              ))}
              {status === "submitted" && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Thinking…
                </div>
              )}
              {error && (
                <div className="rounded-md border border-border bg-surface-2 p-3 text-xs text-muted-foreground">
                  {error.message || "Something went wrong. Try again."}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Composer */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="px-3 pt-3 pb-2"
        >
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onFocus={() => setExpanded(true)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  } else if (e.key === "Escape") {
                    if (isLoading) stop();
                    else {
                      setExpanded(false);
                      textareaRef.current?.blur();
                    }
                  }
                }}
                rows={1}
                placeholder={PLACEHOLDER}
                aria-label="Ask your AI Marketing Assistant"
                className="max-h-[160px] min-h-[36px] w-full resize-none rounded-xl border border-border bg-surface px-3 py-2 text-xs text-foreground outline-none placeholder:text-muted-foreground focus:border-border-strong"
              />
            </div>
            {isLoading ? (
              <button
                type="button"
                onClick={() => stop()}
                aria-label="Stop generating"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border bg-surface text-foreground hover:bg-surface-2"
              >
                <Square className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                type="submit"
                aria-label="Send"
                disabled={!input.trim()}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground disabled:opacity-40"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Examples + shortcut hint */}
          {expanded && messages.length === 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => send(ex)}
                  className="rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
                >
                  {ex}
                </button>
              ))}
            </div>
          )}
          <div className="mt-2 flex items-center justify-between px-1 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Command className="h-3 w-3" /> K to focus · Shift+Enter for newline · Esc to close
            </span>
            {expanded && messages.length === 0 && (
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="hover:text-foreground"
              >
                Hide
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

function MessageRow({
  message,
  onSaveDraft,
  saving,
  saved,
  canSave,
}: {
  message: UIMessage;
  onSaveDraft: (m: UIMessage) => void;
  saving: boolean;
  saved: boolean;
  canSave: boolean;
}) {
  const text = messageText(message);
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl bg-primary px-3.5 py-2 text-sm text-primary-foreground">
          {text}
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-2">
      <AssistantMessage text={text} />
      {text.trim().length > 0 && (
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => onSaveDraft(message)}
            disabled={!canSave || saving || saved}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1 text-[11px] text-foreground hover:bg-surface-2 disabled:opacity-60"
          >
            {saving ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <FileText className="h-3 w-3" />
            )}
            {saved ? "Saved to Drafts" : saving ? "Saving…" : "Save as Draft"}
          </button>
          <span className="text-[10px] text-muted-foreground">
            Nothing publishes without your review.
          </span>
        </div>
      )}
    </div>
  );
}

// Unused import guard for tree-shake friendliness.
export { X };
