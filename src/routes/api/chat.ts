import { createFileRoute } from "@tanstack/react-router";
import {
  convertToModelMessages,
  streamText,
  type UIMessage,
} from "ai";

import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { buildStrategistSystemPrompt } from "@/lib/strategist-prompt";

type ChatRequestBody = { messages?: unknown };

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env.LOVABLE_API_KEY;
        if (!key) {
          return new Response(
            "The AI strategist isn't set up yet. Please try again in a moment.",
            { status: 500 },
          );
        }

        const { messages } = (await request.json()) as ChatRequestBody;
        if (!Array.isArray(messages)) {
          return new Response("Missing messages.", { status: 400 });
        }

        try {
          const gateway = createLovableAiGatewayProvider(key);
          const model = gateway("google/gemini-3-flash-preview");

          const result = streamText({
            model,
            system: buildStrategistSystemPrompt(),
            messages: await convertToModelMessages(messages as UIMessage[]),
          });

          return result.toUIMessageStreamResponse({
            originalMessages: messages as UIMessage[],
          });
        } catch (error) {
          const status =
            error && typeof error === "object" && "status" in error
              ? Number((error as { status?: number }).status)
              : 500;
          if (status === 429) {
            return new Response(
              "The strategist is a bit busy right now. Wait a few seconds and try again.",
              { status: 429 },
            );
          }
          if (status === 402) {
            return new Response(
              "This workspace is out of AI credits. Add more to keep chatting.",
              { status: 402 },
            );
          }
          console.error("[/api/chat] error", error);
          return new Response(
            "Something went wrong on our end. Try again in a moment.",
            { status: 500 },
          );
        }
      },
    },
  },
});
