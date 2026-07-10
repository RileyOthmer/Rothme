import type { IntegrationDefinition } from "./types";

/**
 * Generic, adapter-free logo tile. Uses the platform's brand color +
 * two-letter mark from the registry. Same shape for every platform so
 * the grid stays visually calm — no chasing 29 external logo files.
 */
export function PlatformLogo({
  integration,
  size = 40,
}: {
  integration: IntegrationDefinition;
  size?: number;
}) {
  const bg = integration.brandColor ?? "hsl(var(--surface-2))";
  // Yellow marks need dark text for contrast.
  const isLight = bg.toLowerCase() === "#ffe01b" || bg.toLowerCase() === "#fffc00";
  const fg = isLight ? "#111" : "#fff";
  return (
    <div
      aria-hidden
      className="grid shrink-0 place-items-center rounded-xl font-semibold tracking-tight shadow-xs ring-1 ring-black/5"
      style={{
        width: size,
        height: size,
        background: bg,
        color: fg,
        fontSize: size * 0.36,
      }}
    >
      {integration.mark}
    </div>
  );
}
