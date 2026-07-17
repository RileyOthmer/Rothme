import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { ArrowUp, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { AssistantMessage, messageText } from "./AssistantMessage";
import { StrategistMark } from "./StrategistMark";

export type AssistantChatProps = {
  threadId: string;
  initialMessages: UIMessage[];
  seedInput?: string;
  autoFocus?: boolean;
  onMessagesChange?: (messages: UIMessage[]) => void;
  compact?: boolean;
};

const suggestions = [
  "Promote my business.",
  "Create next week's content.",
  "Write a Facebook ad.",
  "Generate Instagram captions.",
  "Create a Google Business post.",
  "Write YouTube video descriptions.",
  "Generate TikTok captions.",
];

export function AssistantChat({
  threadId,
  initialMessages,
  seedInput = "",
  autoFocus = true,
  onMessagesChange,
  compact = false,
}: AssistantChatProps) {
  const [input, setInput] = useState(seedInput);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, stop, error } = useChat({
    id: threadId,
    messages: initialMessages,
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  // Persist messages upstream whenever they change.
  useEffect(() => {
    onMessagesChange?.(messages);
  }, [messages, onMessagesChange]);

  // Autoscroll to bottom on every new chunk.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, status]);

  // Focus composer on mount + after stream completes + after thread switch.
  useEffect(() => {
    if (autoFocus) textareaRef.current?.focus();
  }, [autoFocus, threadId, status === "ready"]);

  // Update composer when seed changes (e.g. panel opened from a card).
  useEffect(() => {
    if (seedInput) {
      setInput(seedInput);
      textareaRef.current?.focus();
    }
  }, [seedInput]);

  const isLoading = status === "submitted" || status === "streaming";

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    setInput("");
    void sendMessage({ text: trimmed });
  };

  const empty = messages.length === 0;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto"
      >
        <div className={compact ? "mx-auto max-w-2xl px-4 py-6" : "mx-auto max-w-2xl px-4 py-10 sm:px-6"}>
          {empty ? (
            <EmptyState
              onPick={(text) => {
                setInput(text);
                textareaRef.current?.focus();
              }}
              compact={compact}
            />
          ) : (
            <div className="space-y-8">
              {messages.map((m) => (
                <MessageRow key={m.id} message={m} />
              ))}
              {status === "submitted" && (
                <div className="flex items-start gap-3">
                  <StrategistMark size={compact ? 28 : 32} />
                  <div className="pt-1 text-sm text-muted-foreground">
                    <span className="inline-flex animate-pulse">Thinking…</span>
                  </div>
                </div>
              )}
              {error && (
                <div className="rounded-md border border-border bg-surface-2 p-3 text-sm text-muted-foreground">
                  {error.message ||
                    "Something went wrong. Try sending that again."}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-border bg-background/80 backdrop-blur-md">
        <form
          className="mx-auto max-w-2xl px-4 py-3 sm:px-6"
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <div className="flex items-end gap-2 rounded-xl border border-border bg-surface p-2 shadow-sm focus-within:border-border-strong">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              rows={1}
              placeholder="Ask about your marketing…"
              className="max-h-40 min-h-[36px] flex-1 resize-none border-0 bg-transparent px-2 py-1.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            {isLoading ? (
              <button
                type="button"
                onClick={() => stop()}
                aria-label="Stop"
                className="grid h-8 w-8 place-items-center rounded-md border border-border bg-surface text-foreground transition-colors hover:bg-surface-2"
              >
                <Square className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                type="submit"
                aria-label="Send"
                disabled={!input.trim()}
                className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground transition-opacity disabled:opacity-40"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            )}
          </div>
          <p className="mt-2 px-1 text-[11px] text-muted-foreground">
            The strategist explains everything in plain English and tells you how confident it is.
          </p>
        </form>
      </div>
    </div>
  );
}

function MessageRow({ message }: { message: UIMessage }) {
  const text = messageText(message);
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl bg-primary px-4 py-2.5 text-sm text-primary-foreground">
          {text}
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-3">
      <StrategistMark size={32} />
      <div className="min-w-0 flex-1 pt-0.5">
        <AssistantMessage text={text} />
      </div>
    </div>
  );
}

function EmptyState({
  onPick,
  compact,
}: {
  onPick: (text: string) => void;
  compact: boolean;
}) {
  return (
    <div className={compact ? "pt-4" : "pt-8"}>
      <div className="flex flex-col items-center text-center">
        <StrategistMark size={compact ? 44 : 56} />
        <h2 className="mt-4 font-serif text-2xl text-foreground sm:text-3xl">
          Hi. I'm your <em className="italic">strategist</em>.
        </h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Ask me anything about your marketing. I'll explain what's happening,
          why, and what to do next — in plain English.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onPick(s)}
            className="rounded-xl border border-border bg-surface px-4 py-3 text-left text-sm text-foreground shadow-xs transition-colors hover:bg-surface-2"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
