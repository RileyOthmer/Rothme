import type { ReactNode } from "react";

/**
 * Renders a plain-English phrase with the technical term as a tooltip.
 * Use only inside advanced disclosures — never in top-level copy.
 */
export function PlainTerm({
  term,
  children,
}: {
  term: string;
  children: ReactNode;
}) {
  return (
    <abbr
      title={term}
      className="cursor-help border-b border-dotted border-muted-foreground/60 no-underline"
    >
      {children}
    </abbr>
  );
}
