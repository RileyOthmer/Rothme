import type { UIMessage } from "ai";
import ReactMarkdown from "react-markdown";

type Confidence = "Confident" | "Fairly sure" | "Not sure yet";

const CONFIDENCE_RE = /^\s*Confidence:\s*(Confident|Fairly sure|Not sure yet)\s*$/im;

const pillStyles: Record<Confidence, string> = {
  Confident: "bg-[color-mix(in_oklab,var(--success)_14%,transparent)] text-[color:var(--success)]",
  "Fairly sure":
    "bg-[color-mix(in_oklab,var(--warning)_18%,transparent)] text-[color-mix(in_oklab,var(--warning)_60%,var(--foreground))]",
  "Not sure yet":
    "bg-muted text-muted-foreground",
};

export function messageText(m: UIMessage): string {
  return m.parts
    .map((p) => (p.type === "text" ? p.text : ""))
    .join("");
}

export function AssistantMessage({ text }: { text: string }) {
  // Split into blocks separated by a blank line, so we can pull out
  // confidence markers per recommendation.
  const blocks = text.split(/\n{2,}/);
  return (
    <div className="space-y-4 text-[15px] leading-relaxed text-foreground">
      {blocks.map((block, i) => {
        const match = block.match(CONFIDENCE_RE);
        if (!match) {
          return (
            <div key={i} className="prose-block">
              <ReactMarkdown>{block}</ReactMarkdown>
            </div>
          );
        }
        const level = match[1] as Confidence;
        const body = block.replace(CONFIDENCE_RE, "").trim();
        return (
          <div key={i} className="space-y-2">
            {body && (
              <div className="prose-block">
                <ReactMarkdown>{body}</ReactMarkdown>
              </div>
            )}
            <span
              className={
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium " +
                pillStyles[level]
              }
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
              {level}
            </span>
          </div>
        );
      })}
    </div>
  );
}
