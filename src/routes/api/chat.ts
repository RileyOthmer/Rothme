import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
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

        // Require a signed-in user — the AI gateway is a paid resource and
        // must not be reachable by anonymous scripts.
        const authHeader = request.headers.get("authorization") ?? "";
        const bearer = authHeader.toLowerCase().startsWith("bearer ")
          ? authHeader.slice(7).trim()
          : "";
        const supabaseUrl = process.env.SUPABASE_URL;
        const publishable = process.env.SUPABASE_PUBLISHABLE_KEY;
        if (!bearer || !supabaseUrl || !publishable) {
          return new Response("Sign in to use the strategist.", { status: 401 });
        }
        const supabase = createClient(supabaseUrl, publishable, {
          auth: { persistSession: false, autoRefreshToken: false },
          global: { headers: { Authorization: `Bearer ${bearer}` } },
        });
        const { data: userData, error: userErr } = await supabase.auth.getUser(bearer);
        if (userErr || !userData.user) {
          return new Response("Sign in to use the strategist.", { status: 401 });
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
