/**
 * Integration Hub — types.
 *
 * The registry describes WHAT platforms exist. Connections describe WHICH
 * ones a user has linked and their live status. The UI reads both.
 * No platform-specific logic lives in the UI.
 */

export type IntegrationCategory =
  | "advertising"
  | "social"
  | "ecommerce"
  | "payments"
  | "analytics"
  | "email"
  | "crm"
  | "presence";

export const CATEGORY_LABEL: Record<IntegrationCategory, string> = {
  advertising: "Advertising",
  social: "Social",
  ecommerce: "Ecommerce",
  payments: "Payments",
  analytics: "Analytics",
  email: "Email & SMS",
  crm: "CRM",
  presence: "Business presence",
};

export type ConnectionStatus =
  | "connected"
  | "disconnected"
  | "syncing"
  | "error";

/**
 * Static description of a platform. One entry per platform in the registry.
 * Everything here is data — no functions, no imports of adapter code.
 * Adapter/OAuth wiring lands separately per provider on the v2 roadmap.
 */
export type IntegrationDefinition = {
  id: string;
  name: string;
  category: IntegrationCategory;
  /** One-sentence, plain-English description of what Velora reads. */
  summary: string;
  /** Human-readable permissions Velora will request. Kept generic pre-OAuth. */
  permissions: string[];
  /** True once Velora has an adapter that can actually pull data. */
  available: boolean;
  /** Optional brand color for the logo mark. */
  brandColor?: string;
  /** Two-letter mark shown inside the logo tile. */
  mark: string;
};

/**
 * Live connection state for the current user. The registry is static; this
 * comes from the server per user.
 */
export type ConnectionState = {
  integrationId: string;
  status: ConnectionStatus;
  connectedAt?: string; // ISO
  lastSyncedAt?: string; // ISO
  errorMessage?: string;
};
