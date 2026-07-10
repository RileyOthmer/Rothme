import { createFileRoute, redirect } from "@tanstack/react-router";

import { loadThreads, newThreadId } from "@/lib/assistant-store";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "Strategist — Velora" },
      {
        name: "description",
        content:
          "Chat with your senior marketing strategist. Plain-English answers with the why and the evidence.",
      },
    ],
  }),
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    const threads = loadThreads().filter((t) => !t.id.startsWith("panel:"));
    const target = threads[0]?.id ?? newThreadId();
    throw redirect({ to: "/assistant/$threadId", params: { threadId: target } });
  },
  component: () => null,
});
