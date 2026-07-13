import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/publishing/approvals")({
  component: ApprovalsPage,
});

function ApprovalsPage() {
  return (
    <div className="rounded-lg border border-dashed border-border p-10 text-center">
      <CheckCircle2 className="mx-auto h-8 w-8 text-muted-foreground" />
      <p className="mt-3 text-sm font-medium">No approvals pending</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Approval workflows will surface here when a teammate submits a post for review.
      </p>
    </div>
  );
}
