import { MessageCircle } from "lucide-react";

import { openAssistant } from "@/hooks/use-assistant";

export function AskAboutButton({
  seed,
  threadKey,
  label = "Ask about this",
}: {
  seed: string;
  threadKey: string;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => openAssistant({ seedMessage: seed, threadKey })}
      className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
    >
      <MessageCircle className="h-3 w-3" />
      {label}
    </button>
  );
}
