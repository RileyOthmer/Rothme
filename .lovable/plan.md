## AI strategist — build plan

A real, streaming AI assistant that feels like a senior marketing strategist. Lives both as a full page (`/assistant`) and as a slide-in panel opened from any dashboard card. Threaded conversations (one per topic) persisted in **localStorage** for now — no auth required for the demo. Real model calls via Lovable AI Gateway.

### 1. Backend

- **`src/lib/ai-gateway.server.ts`** — provider helper from the gateway knowledge (name: `lovable`).
- **`src/routes/api/chat.ts`** — streaming server route. Reads `LOVABLE_API_KEY`, calls `streamText` with model `google/gemini-3-flash-preview` (fast, multimodal, cheap for chat), returns `toUIMessageStreamResponse`. Surfaces 402 / 429 with clear messages.
- **`ai_gateway--create`** to ensure `LOVABLE_API_KEY` exists.

### 2. The strategist system prompt (the heart of this feature)

Locked-in rules the model must follow every turn:

- You are a **senior marketing strategist** talking to a business owner who is not a marketer.
- Never use jargon. Ban list: CTR, CPC, CPM, ROAS, impressions, reach, conversion rate, funnel, attribution, engagement rate, bounce rate. If one slips in, immediately explain it in one plain sentence.
- Every recommendation must include: **what to do**, **why**, and **the evidence** ("last week your Instagram ads brought in 12 more customers than the week before").
- Every recommendation ends with a **confidence line**: *"I'm confident"*, *"I'm fairly sure"*, or *"I'm not sure yet — here's what would help me tell"*.
- Tone: friendly, professional, confident, helpful. Never robotic, never salesy.
- Formatting: short sentences. Bullets only for lists of 3+ items. No headings unless the user asks for a written plan.
- When context is thin, ask **one** clarifying question — not a checklist.

Also passed each turn: today's mock dashboard snapshot (health score, growth delta, top performer, laggard) as a compact JSON block in the system message, so the model can cite real numbers.

### 3. Frontend — AI Elements

Install: `bun x ai-elements@latest add conversation message prompt-input shimmer`.

- **`src/routes/assistant.tsx`** — full-page chat. Left rail: thread list + "New conversation" button (localStorage-backed). Main: `Conversation` → `Message` / `MessageResponse` (assistant messages have no background; user bubble uses `primary` / `primary-foreground`), `PromptInput` with textarea + right-aligned submit in footer, `Shimmer` "Thinking…" during `submitted`.
- **`src/routes/assistant.$threadId.tsx`** — dedicated URL per thread; reloading restores that thread's messages. Chat window keyed by `threadId`.
- **Empty state** — strategist mark (a small generated portrait-style logomark, not a Sparkles icon), one-line intro ("Hi. I'm your strategist. Ask me anything about your marketing."), 4 suggested prompts:
  - "How did I do this week?"
  - "What should I focus on today?"
  - "My ads feel expensive — are they?"
  - "Write me a plan for next month."

### 4. Slide-in panel + card entry points

- **`src/components/assistant/AssistantPanel.tsx`** — right-side `Sheet` (existing shadcn primitive) with the same AI Elements chat inside, keyed by a per-context thread ID.
- **`src/hooks/use-assistant.ts`** — `openAssistant({ contextLabel, seedMessage })` opens the panel and pre-fills the composer (e.g. clicking "Ask about this" on the Growth card seeds *"Why did we grow this week?"*).
- Add a subtle "Ask about this" ghost link to `HealthScore`, `GrowthCallout`, `PerformanceSummary`, and each row inside Performance. Nothing else about those cards changes.
- Floating "Ask" pill (bottom-right of `/dashboard`) opens the panel on a general thread.

### 5. Thread storage (localStorage)

- `src/lib/assistant-store.ts` — `{ id, title, updatedAt, messages: UIMessage[] }[]` under key `northstar.assistant.threads.v1`.
- Idempotent bootstrap guarded by `typeof window !== 'undefined'`, read once at mount, persist on every message + on stream `onFinish`.
- Thread title = first 6 words of the user's first message (updates on the first turn only).
- Delete + rename inline on hover in the thread list; delete confirms.

### 6. Visual + copy details

- Strategist avatar: a tiny generated calm portrait mark used in the empty state and next to assistant messages (once, not per bubble).
- Assistant markdown via `MessageResponse` — short lines, hairline dividers between recommendations.
- Confidence rendered as a small pill below each recommendation (green "Confident", amber "Fairly sure", grey "Not sure yet"). The model outputs it inline; we style it via a tiny post-parse regex — no schema constraints on the model.
- Nav: add "Ask" link in dashboard header → `/assistant`.

### Out of scope

- Auth / database-backed threads (localStorage only; can upgrade to Lovable Cloud later without changing the UI).
- Real marketing data ingestion — snapshot passed to the model is still from `dashboard-mock`.
- Tool calling / actions the assistant can execute. This turn is chat-only; "done-for-you actions" stay a follow-up.
- Voice, attachments, sharing threads.
- Changes to landing page or existing dashboard cards beyond adding the "Ask about this" ghost link.
