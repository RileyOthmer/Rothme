import { createFileRoute, redirect } from "@tanstack/react-router";

import { loadThreads, newThreadId } from "@/lib/assistant-store";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "AI Strategist — ROTHME" },
      {
        name: "description",
        content:
          "Chat with your senior marketing strategist. Plain-English answers with the why, the evidence, and what to do next.",
      },
      { property: "og:title", content: "AI Strategist — ROTHME" },
      {
        property: "og:description",
        content:
          "Your senior marketing strategist, always on. Ask anything about your marketing and get plain-English answers with evidence.",
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
