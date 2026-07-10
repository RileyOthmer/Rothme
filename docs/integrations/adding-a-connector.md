# Adding a new integration

Velora's Integration Hub is registry-driven. Adding a new platform is one file edit.

## Step 1 — Add a registry entry

Open `src/features/integrations/registry.ts` and add an object to `INTEGRATIONS`:

```ts
{
  id: "notion",                       // stable id, snake_case
  name: "Notion",                     // display name
  category: "crm",                    // one of IntegrationCategory
  mark: "NO",                         // two letters shown in the logo tile
  brandColor: "#000000",              // brand color for the tile
  summary: "Docs and notes your team writes about customers.",
  permissions: ["Read pages", "Read databases"],
  available: false,                   // false = "Coming soon" card
}
```

That's it for UI. Search, filters, category chips, empty states, and card
rendering all pick it up automatically. No component code changes.

## Step 2 — When you're ready to make it real

1. **Server enum.** Add the id to the `PROVIDERS` tuple in
   `src/lib/connections.functions.ts`. That opens the persistence layer
   for that provider.
2. **Adapter.** Create `src/features/integrations/adapters/<id>.ts` that
   implements the shared adapter interface (OAuth start, token refresh,
   fetch → `MetricSnapshot`). Adapter code MUST NOT be imported from UI.
3. **Register the adapter.** Add one line to the adapter registry so the
   scheduler picks it up on the next sync cycle.
4. **Flip `available: true`** in the registry entry.

## Rules

- **Never** branch on `id` inside `IntegrationCard`, `IntegrationHub`, or any
  other UI component. If a platform needs custom behavior, it belongs in its
  adapter, not the UI.
- **Never** hard-code platform strings in dashboards or reports. Read them
  from the registry (`getIntegration(id)`).
- **Permissions strings are user-facing.** Write them in plain English —
  "Read ad performance", not "ads_read".
- **`available: false` cards are honest.** They render a "Notify me" button,
  never a fake Connect flow.
