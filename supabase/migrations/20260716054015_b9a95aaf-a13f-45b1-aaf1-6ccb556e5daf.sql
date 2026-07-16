
-- 1. org_memberships: restrict self-insert role
DROP POLICY IF EXISTS "user can insert self as first member" ON public.org_memberships;
CREATE POLICY "user can insert self as first member"
  ON public.org_memberships
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() AND role = 'member');

-- 2. mentions: restrict SELECT to the mentioned user only
DROP POLICY IF EXISTS "user reads own mentions" ON public.mentions;
CREATE POLICY "user reads own mentions"
  ON public.mentions
  FOR SELECT
  TO authenticated
  USING (mentioned_user_id = auth.uid());

-- 3. social_events: remove the null-org loophole
DROP POLICY IF EXISTS "Org members can read social events" ON public.social_events;
CREATE POLICY "Org members can read social events"
  ON public.social_events
  FOR SELECT
  TO authenticated
  USING (org_id IS NOT NULL AND private.is_org_member(org_id, auth.uid()));

-- 4. tasks: prevent non-admins from changing assignee_id/assigner_id/org_id
CREATE OR REPLACE FUNCTION public.tasks_restrict_field_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_admin boolean;
BEGIN
  is_admin := private.has_org_role(OLD.org_id, auth.uid(), 'admin');
  IF NOT is_admin THEN
    IF NEW.assignee_id IS DISTINCT FROM OLD.assignee_id THEN
      RAISE EXCEPTION 'Only org admins can change task assignee';
    END IF;
    IF NEW.assigner_id IS DISTINCT FROM OLD.assigner_id THEN
      RAISE EXCEPTION 'assigner_id cannot be changed';
    END IF;
    IF NEW.org_id IS DISTINCT FROM OLD.org_id THEN
      RAISE EXCEPTION 'org_id cannot be changed';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tasks_restrict_field_changes_trg ON public.tasks;
CREATE TRIGGER tasks_restrict_field_changes_trg
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.tasks_restrict_field_changes();
