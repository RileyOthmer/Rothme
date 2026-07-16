import { type ReactNode } from "react";

interface Props {
  children: ReactNode;
  featureName?: string;
}

/**
 * All features are included once the one-time $200 payment is confirmed.
 * There are no Pro / tier upgrades inside the app — the only role-locked
 * surface is the Admin Console. This component is a pass-through kept for
 * backwards compatibility with existing imports.
 */
export function RequirePro({ children }: Props) {
  return <>{children}</>;
}
