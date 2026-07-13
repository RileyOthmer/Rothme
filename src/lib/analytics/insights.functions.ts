// Server-only AI insights for the Analytics Engine.
// Takes an already-aggregated KPI snapshot from the client (no DB reads here yet
// — the analytics data layer is still deterministic mocks in features/unified).
// Returns a plain-English summary + 2-3 recommended actions.

import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const kpiSchema = z.object({
  label: z.string(),
  value: z.number(),
  previous: z.number(),
});

const inputSchema = z.object({
  range: z.string(),
  platforms: z.array(z.string()),
  kpis: z.array(kpiSchema).max(20),
});

export const getExecutiveInsights = createServerFn({ method: "POST" })
  .inputValidator((d) => inputSchema.parse(d))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) {
      return {
        summary: "AI strategist is temporarily unavailable. Configure LOVABLE_API_KEY to enable insights.",
        actions: [] as string[],
        confidence: "low" as const,
      };
    }
    const gateway = createLovableAiGatewayProvider(key);

    const platformLine = data.platforms.length
      ? `Platforms: ${data.platforms.join(", ")}`
      : "All connected platforms combined";
    const kpiLines = data.kpis.map((k) => {
      const d = k.previous ? ((k.value - k.previous) / k.previous) * 100 : 0;
      return `- ${k.label}: ${Math.round(k.value).toLocaleString()} (${d >= 0 ? "+" : ""}${d.toFixed(1)}% vs previous)`;
    }).join("\n");

    const system = [
      "You are Velora's marketing strategist. Speak like a smart friend, not a robot.",
      "Every answer follows this order: 1) What happened. 2) Why (best guess). 3) One concrete action.",
      "Plain English only. No jargon (no CTR, ROAS, CAC unless asked). No filler.",
      "State a confidence level (high, medium, low) based on how strong the signal is.",
      "Never invent numbers. Only use the KPIs provided.",
    ].join("\n");

    const prompt = [
      `Date range: ${data.range}`,
      platformLine,
      "",
      "KPIs (current vs previous period):",
      kpiLines,
      "",
      "Write:",
      "- A 2-3 sentence summary of what changed and why.",
      "- 2 concrete next actions the user should take this week, each one sentence.",
      "- A confidence rating: high, medium, or low.",
      "",
      "Format as JSON only, no markdown fences:",
      `{"summary":"...","actions":["...","..."],"confidence":"high|medium|low"}`,
    ].join("\n");

    try {
      const { text } = await generateText({
        model: gateway("google/gemini-2.5-flash"),
        system,
        prompt,
      });
      const cleaned = text.trim().replace(/^```(?:json)?/, "").replace(/```$/, "").trim();
      const parsed = JSON.parse(cleaned);
      return {
        summary: String(parsed.summary ?? "").slice(0, 800),
        actions: Array.isArray(parsed.actions) ? parsed.actions.slice(0, 3).map(String) : [],
        confidence: ["high", "medium", "low"].includes(parsed.confidence) ? parsed.confidence : "medium",
      };
    } catch (err: any) {
      return {
        summary: "Couldn't generate insights right now. Try again in a moment.",
        actions: [] as string[],
        confidence: "low" as const,
      };
    }
  });
