import { auth, defineMcp } from "@lovable.dev/mcp-js";
import whoami from "./tools/whoami";
import listWeeklyReports from "./tools/list-weekly-reports";
import getWeeklyReport from "./tools/get-weekly-report";

// Supabase project ref is inlined by Vite at build time. Sentinel keeps the
// issuer well-formed if the literal is unset during manifest extraction; the
// published build inlines the real ref and a token never verifies against it.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "rothme-mcp",
  title: "ROTHME",
  version: "0.1.0",
  instructions:
    "Tools for the ROTHME AI business growth platform. Use `whoami` to verify the signed-in user, `list_weekly_reports` to browse the user's saved weekly reports, and `get_weekly_report` to read a specific report.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [whoami, listWeeklyReports, getWeeklyReport],
});
