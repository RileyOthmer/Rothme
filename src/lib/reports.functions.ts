import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { generateWeeklyReport, weekStartFor } from "./reports-mock";

export const listWeeklyReports = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    // Seed the last 8 weeks lazily if they don't exist for this user.
    const weeks: string[] = [];
    for (let i = 0; i < 8; i++) {
      weeks.push(weekStartFor(i));
    }
    const { data: existing, error } = await context.supabase
      .from("weekly_reports")
      .select("id, week_start, payload, created_at")
      .eq("user_id", context.userId)
      .in("week_start", weeks)
      .order("week_start", { ascending: false });
    if (error) throw new Error(error.message);

    const have = new Set((existing ?? []).map((r) => r.week_start));
    const missing = weeks.filter((w) => !have.has(w));
    if (missing.length > 0) {
      const rows = missing.map((week_start) => ({
        user_id: context.userId,
        week_start,
        payload: generateWeeklyReport(week_start),
      }));
      const { error: insErr } = await context.supabase
        .from("weekly_reports")
        .insert(rows);
      if (insErr) throw new Error(insErr.message);
      const { data: refreshed, error: reErr } = await context.supabase
        .from("weekly_reports")
        .select("id, week_start, payload, created_at")
        .eq("user_id", context.userId)
        .in("week_start", weeks)
        .order("week_start", { ascending: false });
      if (reErr) throw new Error(reErr.message);
      return refreshed ?? [];
    }
    return existing ?? [];
  });

const idSchema = z.object({ id: z.string().uuid() });

export const getWeeklyReport = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => idSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("weekly_reports")
      .select("id, week_start, payload, created_at")
      .eq("user_id", context.userId)
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });
