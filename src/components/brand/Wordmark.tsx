import { Link } from "@tanstack/react-router";

export function Wordmark({ size = "sm" }: { size?: "sm" | "md" }) {
  const dim = size === "md" ? "h-6 w-6" : "h-5 w-5";
  const text = size === "md" ? "text-base" : "text-[15px]";
  return (
    <Link to="/" className="group inline-flex items-center gap-2">
      <span
        aria-hidden
        className={
          "relative grid " + dim + " place-items-center rounded-full border border-border-strong bg-surface shadow-xs"
        }
      >
        <span className="absolute inset-[3px] rounded-full border border-foreground/70" />
        <span className="absolute right-[3px] top-[3px] h-1 w-1 rounded-full bg-foreground" />
      </span>
      <span
        className={
          "font-serif " +
          text +
          " font-medium tracking-tight text-foreground transition-opacity group-hover:opacity-80"
        }
      >
        velora
      </span>
    </Link>
  );
}
