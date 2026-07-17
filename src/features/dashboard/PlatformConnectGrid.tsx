import { Link } from "@tanstack/react-router";
import { Plug2 } from "lucide-react";

type PlatformCard = {
  id: string;
  name: string;
  category: string;
  mark: string;
  brandColor: string;
};

/**
 * The full marketing stack Rothme connects to. Purely presentational —
 * every "Connect" click routes to /settings/platforms where the real
 * OAuth / API-key flow lives. Never fabricates a "connected" state.
 */
const PLATFORMS: PlatformCard[] = [
  { id: "meta", name: "Meta Business Suite", category: "Social & Ads", mark: "M", brandColor: "#0866FF" },
  { id: "google_ads", name: "Google Ads", category: "Advertising", mark: "G", brandColor: "#4285F4" },
  { id: "google_analytics", name: "Google Analytics", category: "Analytics", mark: "A", brandColor: "#E37400" },
  { id: "shopify", name: "Shopify", category: "E-commerce", mark: "S", brandColor: "#95BF47" },
  { id: "hubspot", name: "HubSpot", category: "CRM", mark: "H", brandColor: "#FF7A59" },
  { id: "notion", name: "Notion", category: "Workspace", mark: "N", brandColor: "#111111" },
  { id: "google_sheets", name: "Google Sheets", category: "Data", mark: "S", brandColor: "#0F9D58" },
  { id: "resend", name: "Resend", category: "Email", mark: "R", brandColor: "#000000" },
  { id: "twilio", name: "Twilio", category: "SMS", mark: "T", brandColor: "#F22F46" },
  { id: "mailchimp", name: "Mailchimp", category: "Email Marketing", mark: "M", brandColor: "#FFE01B" },
];

export function PlatformConnectGrid() {
  return (
    <section aria-labelledby="platform-connect-heading">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2
            id="platform-connect-heading"
            className="text-base font-semibold tracking-tight text-foreground"
          >
            Connect your marketing stack
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            The more Rothme knows, the sharper your AI CMO gets. Nothing shows real
            data until a platform is connected.
          </p>
        </div>
        <Link
          to="/settings/platforms"
          className="hidden text-xs font-medium text-primary hover:underline sm:inline"
        >
          Manage all →
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PLATFORMS.map((p) => (
          <div
            key={p.id}
            className="group relative flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md hover:shadow-primary/5"
          >
            <span
              aria-hidden
              className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-sm font-semibold text-white shadow-sm"
              style={{ backgroundColor: p.brandColor }}
            >
              {p.mark}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">{p.name}</p>
              <p className="mt-0.5 text-[11px] uppercase tracking-widest text-muted-foreground">
                {p.category}
              </p>
            </div>
            <Link
              to="/settings/platforms"
              className="inline-flex h-8 items-center gap-1 rounded-lg border border-border bg-background px-3 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-surface-2 hover:text-primary"
              aria-label={`Connect ${p.name}`}
            >
              <Plug2 className="h-3 w-3" />
              Connect
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
