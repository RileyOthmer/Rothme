
-- 1) Move SECURITY DEFINER helpers out of the PostgREST-exposed public schema
CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO authenticated, anon, service_role;

ALTER FUNCTION public.has_role(uuid, public.app_role) SET SCHEMA private;
ALTER FUNCTION public.is_org_member(uuid, uuid) SET SCHEMA private;
ALTER FUNCTION public.has_org_role(uuid, uuid, text) SET SCHEMA private;
ALTER FUNCTION public.has_active_subscription(uuid, text) SET SCHEMA private;
ALTER FUNCTION public.claim_first_admin() SET SCHEMA private;
ALTER FUNCTION public.ensure_personal_org(uuid, text) SET SCHEMA private;
ALTER FUNCTION public.handle_new_user() SET SCHEMA private;

-- RLS-evaluated helpers need EXECUTE for the querying role
REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.is_org_member(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.has_org_role(uuid, uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.has_active_subscription(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.claim_first_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION private.ensure_personal_org(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.handle_new_user() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.is_org_member(uuid, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.has_org_role(uuid, uuid, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.has_active_subscription(uuid, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.claim_first_admin() TO service_role;
GRANT EXECUTE ON FUNCTION private.ensure_personal_org(uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION private.handle_new_user() TO service_role;

-- 2) Bind onboarding tables to the authenticated user
ALTER TABLE public.onboarding_responses ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.onboarding_events    ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS onboarding_responses_user_idx ON public.onboarding_responses(user_id);
CREATE INDEX IF NOT EXISTS onboarding_events_user_idx    ON public.onboarding_events(user_id);

-- Trigger auto-sets user_id from the authenticated caller so client code doesn't need to
CREATE OR REPLACE FUNCTION public.set_onboarding_user_id()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    NEW.user_id := auth.uid();
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS onboarding_responses_set_user_id ON public.onboarding_responses;
CREATE TRIGGER onboarding_responses_set_user_id
  BEFORE INSERT ON public.onboarding_responses
  FOR EACH ROW EXECUTE FUNCTION public.set_onboarding_user_id();

DROP TRIGGER IF EXISTS onboarding_events_set_user_id ON public.onboarding_events;
CREATE TRIGGER onboarding_events_set_user_id
  BEFORE INSERT ON public.onboarding_events
  FOR EACH ROW EXECUTE FUNCTION public.set_onboarding_user_id();

-- Prevent user_id from being changed on update
CREATE OR REPLACE FUNCTION public.lock_onboarding_user_id()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
BEGIN
  IF OLD.user_id IS NOT NULL AND NEW.user_id IS DISTINCT FROM OLD.user_id THEN
    RAISE EXCEPTION 'user_id is immutable';
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS onboarding_responses_lock_user_id ON public.onboarding_responses;
CREATE TRIGGER onboarding_responses_lock_user_id
  BEFORE UPDATE ON public.onboarding_responses
  FOR EACH ROW EXECUTE FUNCTION public.lock_onboarding_user_id();

-- Replace the format-only policies with ownership-bound policies
DROP POLICY IF EXISTS "insert own anonymous response" ON public.onboarding_responses;
DROP POLICY IF EXISTS "update own anonymous response" ON public.onboarding_responses;
DROP POLICY IF EXISTS "select own anonymous response" ON public.onboarding_responses;

CREATE POLICY "insert own onboarding response"
  ON public.onboarding_responses FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND anon_id IS NOT NULL
    AND char_length(anon_id) BETWEEN 8 AND 128
  );

CREATE POLICY "update own onboarding response"
  ON public.onboarding_responses FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "select own onboarding response"
  ON public.onboarding_responses FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "insert own anonymous events" ON public.onboarding_events;
DROP POLICY IF EXISTS "select own anonymous events" ON public.onboarding_events;

CREATE POLICY "insert own onboarding events"
  ON public.onboarding_events FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND anon_id IS NOT NULL
    AND char_length(anon_id) BETWEEN 8 AND 128
    AND event_type = ANY (ARRAY[
      'onboarding_started','step_viewed','step_completed',
      'step_skipped','onboarding_completed','onboarding_abandoned'
    ])
  );

CREATE POLICY "select own onboarding events"
  ON public.onboarding_events FOR SELECT TO authenticated
  USING (user_id = auth.uid());
