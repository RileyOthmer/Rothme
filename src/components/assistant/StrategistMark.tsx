export function StrategistMark({ size = 40 }: { size?: number }) {
  const s = size;
  return (
    <span
      aria-hidden
      className="relative inline-grid place-items-center rounded-full border border-border-strong bg-surface shadow-xs"
      style={{ height: s, width: s }}
    >
      <span
        className="absolute rounded-full border border-foreground/70"
        style={{ inset: Math.round(s * 0.14) }}
      />
      <span
        className="absolute rounded-full bg-foreground"
        style={{
          right: Math.round(s * 0.18),
          top: Math.round(s * 0.18),
          height: Math.round(s * 0.1),
          width: Math.round(s * 0.1),
        }}
      />
    </span>
  );
}
