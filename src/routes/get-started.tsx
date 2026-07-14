import { createFileRoute, Outlet, Link } from "@tanstack/react-router";
import { Wordmark } from "@/components/brand/Wordmark";

export const Route = createFileRoute("/get-started")({
  head: () => ({
    meta: [
      { title: "Get started — ROTHME" },
      { name: "description", content: "Tell us about your business. ROTHME builds you a personalized marketing workspace in minutes." },
      { property: "og:title", content: "Get started — ROTHME" },
      { property: "og:description", content: "Answer a few questions. ROTHME tailors your workspace, integrations, and AI strategist to your business." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GetStartedLayout,
});

function GetStartedLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/70">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4 sm:px-6">
          <Link to="/"><Wordmark /></Link>
          <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">
            Save & exit
          </Link>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
