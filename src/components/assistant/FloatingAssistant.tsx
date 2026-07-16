import { useChat } from "@ai-sdk/react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { DefaultChatTransport, type UIMessage } from "ai";
import { ArrowUp, Maximize2, MessageCircle, Square, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { AssistantMessage, messageText } from "./AssistantMessage";
import { StrategistMark } from "./StrategistMark";

const QUICK_ACTIONS = [
  { label: "Improve SEO", prompt: "Help me improve my SEO. Where should I start?" },
  { label: "Build a marketing plan", prompt: "Build me a marketing plan for the next 30 days." },
  { label: "Create ads", prompt: "Help me create ads that will actually convert for my business." },
  { label: "Generate content", prompt: "Generate content ideas I can publish this week." },
  { label: "Find growth opportunities", prompt: "Find the biggest growth opportunities in my business right now." },
];

export function FloatingAssistant() {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  // Hide on the full-page assistant + auth pages to avoid duplication.
  const hidden = useMemo(() => {
    const p = location.pathname;
    return p.startsWith("/assistant") || p.startsWith("/auth") || p.startsWith("/lovable");
  }, [location.pathname]);

  const threadId = "panel:floating";
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, stop, error } = useChat({
    id: threadId,
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (open) setTimeout(() => textareaRef.current?.focus(), 50);
  }, [open]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, status, open]);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    setInput("");
    void sendMessage({ text: trimmed });
  };

  if (hidden) return null;

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open Rothme AI assistant"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-primary-foreground shadow-lg shadow-black/20 transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="text-sm font-medium">Ask Rothme AI</span>
        </button>
      )}

      {open && (
        <div className="fixed bottom-5 right-5 z-50 flex h-[600px] max-h-[calc(100vh-2rem)] w-[400px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl shadow-black/30">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-3">
            <div className="flex items-center gap-2.5">
              <StrategistMark size={28} />
              <div className="leading-tight">
                <div className="text-sm font-semibold text-foreground">Rothme AI</div>
                <div className="text-[11px] text-muted-foreground">Marketing Advisor</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  void navigate({ to: "/assistant" });
                }}
                aria-label="Open full chat"
                className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-surface-2 hover:text-foreground"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-surface-2 hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto">
            <div className="px-4 py-4">
              {messages.length === 0 ? (
                <Greeting onPick={send} />
              ) : (
                <div className="space-y-6">
                  {messages.map((m) => (
                    <MessageRow key={m.id} message={m} />
                  ))}
                  {status === "submitted" && (
                    <div className="flex items-start gap-2.5">
                      <StrategistMark size={26} />
                      <div className="pt-1 text-sm text-muted-foreground">
                        <span className="inline-flex animate-pulse">Thinking…</span>
                      </div>
                    </div>
                  )}
                  {error && (
                    <div className="rounded-md border border-border bg-surface-2 p-3 text-xs text-muted-foreground">
                      {error.message || "Something went wrong. Try sending that again."}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Composer */}
          <form
            className="border-t border-border bg-background/80 px-3 py-3"
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
                placeholder="Ask anything about your marketing…"
                className="max-h-32 min-h-[32px] flex-1 resize-none border-0 bg-transparent px-2 py-1 text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
              {isLoading ? (
                <button
                  type="button"
                  onClick={() => stop()}
                  aria-label="Stop"
                  className="grid h-8 w-8 place-items-center rounded-md border border-border bg-surface text-foreground hover:bg-surface-2"
                >
                  <Square className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button
                  type="submit"
                  aria-label="Send"
                  disabled={!input.trim()}
                  className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground disabled:opacity-40"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </>
  );
}

function MessageRow({ message }: { message: UIMessage }) {
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
    <div className="flex items-start gap-2.5">
      <StrategistMark size={26} />
      <div className="min-w-0 flex-1 pt-0.5">
        <AssistantMessage text={text} />
      </div>
    </div>
  );
}

function Greeting({ onPick }: { onPick: (text: string) => void }) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2.5">
        <StrategistMark size={30} />
        <div className="min-w-0 flex-1 space-y-3 pt-0.5 text-[14px] leading-relaxed text-foreground">
          <p>
            Hi! I'm your <span className="font-medium">Rothme AI Marketing Advisor</span>.
          </p>
          <p className="text-muted-foreground">
            I already analyzed your business. Would you like me to:
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2 pl-[38px]">
        {QUICK_ACTIONS.map((a) => (
          <button
            key={a.label}
            type="button"
            onClick={() => onPick(a.prompt)}
            className="rounded-xl border border-border bg-surface px-3.5 py-2.5 text-left text-sm text-foreground shadow-xs transition-colors hover:bg-surface-2"
          >
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}
