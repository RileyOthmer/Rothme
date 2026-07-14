import { createFileRoute } from "@tanstack/react-router";
import { DevCenterShell, EmptyPanel } from "@/features/dev-center/DevCenterShell";

export const Route = createFileRoute("/_authenticated/dev-center/webhooks")({
  component: WebhooksPage,
});

function WebhooksPage() {
  return (
    <DevCenterShell
      title="Webhooks"
      description="Inbound webhook subscriptions per platform. HMAC signatures are verified before payloads are processed."
    >
      <EmptyPanel
        title="No webhook subscriptions yet"
        body="Once a platform is connected and the account grants webhook scopes, its subscriptions and delivery history appear here."
      />
    </DevCenterShell>
  );
}
