
REVOKE SELECT ON public.onboarding_responses FROM authenticated;

DROP POLICY IF EXISTS "authenticated can insert onboarding events" ON public.onboarding_events;
DROP POLICY IF EXISTS "authenticated can insert onboarding responses" ON public.onboarding_responses;
DROP POLICY IF EXISTS "authenticated can update onboarding responses" ON public.onboarding_responses;

CREATE POLICY "insert own anonymous events"
  ON public.onboarding_events FOR INSERT TO authenticated
  WITH CHECK (
    anon_id IS NOT NULL
    AND char_length(anon_id) BETWEEN 8 AND 128
    AND event_type IN ('onboarding_started','step_viewed','step_completed','step_skipped','onboarding_completed','onboarding_abandoned')
  );

CREATE POLICY "insert own anonymous response"
  ON public.onboarding_responses FOR INSERT TO authenticated
  WITH CHECK (
    anon_id IS NOT NULL
    AND char_length(anon_id) BETWEEN 8 AND 128
  );

CREATE POLICY "update own anonymous response"
  ON public.onboarding_responses FOR UPDATE TO authenticated
  USING (
    anon_id IS NOT NULL
    AND char_length(anon_id) BETWEEN 8 AND 128
  )
  WITH CHECK (
    anon_id IS NOT NULL
    AND char_length(anon_id) BETWEEN 8 AND 128
  );
