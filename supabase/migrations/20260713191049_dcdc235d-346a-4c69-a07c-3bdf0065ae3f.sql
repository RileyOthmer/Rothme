
-- =========================================================================
-- Collaboration v1: orgs, memberships, invites, comments, tasks,
-- approvals, activity feed.
-- =========================================================================

-- Roles enum
DO $$ BEGIN
  CREATE TYPE public.org_role AS ENUM ('owner', 'admin', 'member');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---------- organizations ----------
CREATE TABLE public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  is_personal boolean NOT NULL DEFAULT false,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.organizations TO authenticated;
GRANT ALL ON public.organizations TO service_role;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- ---------- org_memberships ----------
CREATE TABLE public.org_memberships (
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role public.org_role NOT NULL DEFAULT 'member',
  invited_by uuid,
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (org_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.org_memberships TO authenticated;
GRANT ALL ON public.org_memberships TO service_role;
ALTER TABLE public.org_memberships ENABLE ROW LEVEL SECURITY;

CREATE INDEX org_memberships_user_idx ON public.org_memberships(user_id);

-- ---------- security-definer helpers (prevent RLS recursion) ----------
CREATE OR REPLACE FUNCTION public.is_org_member(_org uuid, _user uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.org_memberships
    WHERE org_id = _org AND user_id = _user
  );
$$;

CREATE OR REPLACE FUNCTION public.has_org_role(_org uuid, _user uuid, _min_role text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.org_memberships m
    WHERE m.org_id = _org AND m.user_id = _user
      AND CASE _min_role
        WHEN 'owner'  THEN m.role = 'owner'
        WHEN 'admin'  THEN m.role IN ('owner','admin')
        ELSE TRUE
      END
  );
$$;

-- ---------- organizations policies ----------
CREATE POLICY "org members can read their orgs" ON public.organizations
  FOR SELECT TO authenticated
  USING (public.is_org_member(id, auth.uid()));

CREATE POLICY "authenticated can create orgs" ON public.organizations
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "owners/admins can update their org" ON public.organizations
  FOR UPDATE TO authenticated
  USING (public.has_org_role(id, auth.uid(), 'admin'))
  WITH CHECK (public.has_org_role(id, auth.uid(), 'admin'));

CREATE POLICY "owners can delete non-personal orgs" ON public.organizations
  FOR DELETE TO authenticated
  USING (public.has_org_role(id, auth.uid(), 'owner') AND NOT is_personal);

-- ---------- org_memberships policies ----------
CREATE POLICY "members can read memberships of their orgs" ON public.org_memberships
  FOR SELECT TO authenticated
  USING (public.is_org_member(org_id, auth.uid()));

CREATE POLICY "user can insert self as first member" ON public.org_memberships
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "admins can update memberships" ON public.org_memberships
  FOR UPDATE TO authenticated
  USING (public.has_org_role(org_id, auth.uid(), 'admin'))
  WITH CHECK (public.has_org_role(org_id, auth.uid(), 'admin'));

CREATE POLICY "admins or self can delete memberships" ON public.org_memberships
  FOR DELETE TO authenticated
  USING (public.has_org_role(org_id, auth.uid(), 'admin') OR user_id = auth.uid());

-- ---------- org_invites ----------
CREATE TABLE public.org_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email text NOT NULL,
  role public.org_role NOT NULL DEFAULT 'member',
  invited_by uuid NOT NULL,
  token text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at timestamptz,
  accepted_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.org_invites TO authenticated;
GRANT ALL ON public.org_invites TO service_role;
ALTER TABLE public.org_invites ENABLE ROW LEVEL SECURITY;

CREATE INDEX org_invites_email_idx ON public.org_invites(lower(email));
CREATE INDEX org_invites_org_idx ON public.org_invites(org_id);

CREATE POLICY "members can read invites of their org" ON public.org_invites
  FOR SELECT TO authenticated
  USING (public.is_org_member(org_id, auth.uid()));

CREATE POLICY "admins can create invites" ON public.org_invites
  FOR INSERT TO authenticated
  WITH CHECK (public.has_org_role(org_id, auth.uid(), 'admin') AND invited_by = auth.uid());

CREATE POLICY "admins can update invites" ON public.org_invites
  FOR UPDATE TO authenticated
  USING (public.has_org_role(org_id, auth.uid(), 'admin'))
  WITH CHECK (public.has_org_role(org_id, auth.uid(), 'admin'));

CREATE POLICY "admins can delete invites" ON public.org_invites
  FOR DELETE TO authenticated
  USING (public.has_org_role(org_id, auth.uid(), 'admin'));

-- ---------- comments ----------
CREATE TABLE public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  subject_type text NOT NULL CHECK (subject_type IN ('decision','report','goal','dashboard','task','approval')),
  subject_id text NOT NULL,
  author_id uuid NOT NULL,
  body text NOT NULL CHECK (length(body) BETWEEN 1 AND 4000),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.comments TO authenticated;
GRANT ALL ON public.comments TO service_role;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE INDEX comments_subject_idx ON public.comments(org_id, subject_type, subject_id, created_at);

CREATE POLICY "members can read comments" ON public.comments
  FOR SELECT TO authenticated
  USING (public.is_org_member(org_id, auth.uid()));

CREATE POLICY "members can post comments" ON public.comments
  FOR INSERT TO authenticated
  WITH CHECK (public.is_org_member(org_id, auth.uid()) AND author_id = auth.uid());

CREATE POLICY "author or admin can delete comments" ON public.comments
  FOR DELETE TO authenticated
  USING (author_id = auth.uid() OR public.has_org_role(org_id, auth.uid(), 'admin'));

-- ---------- mentions ----------
CREATE TABLE public.mentions (
  comment_id uuid NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  mentioned_user_id uuid NOT NULL,
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (comment_id, mentioned_user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mentions TO authenticated;
GRANT ALL ON public.mentions TO service_role;
ALTER TABLE public.mentions ENABLE ROW LEVEL SECURITY;

CREATE INDEX mentions_user_idx ON public.mentions(mentioned_user_id, read_at);

CREATE POLICY "user reads own mentions" ON public.mentions
  FOR SELECT TO authenticated
  USING (mentioned_user_id = auth.uid() OR public.is_org_member(org_id, auth.uid()));

CREATE POLICY "members insert mentions" ON public.mentions
  FOR INSERT TO authenticated
  WITH CHECK (public.is_org_member(org_id, auth.uid()));

CREATE POLICY "user updates own mentions" ON public.mentions
  FOR UPDATE TO authenticated
  USING (mentioned_user_id = auth.uid())
  WITH CHECK (mentioned_user_id = auth.uid());

-- ---------- tasks ----------
CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title text NOT NULL CHECK (length(title) BETWEEN 1 AND 200),
  description text,
  assignee_id uuid,
  assigner_id uuid NOT NULL,
  subject_type text CHECK (subject_type IN ('decision','report','goal','dashboard')),
  subject_id text,
  due_date date,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','done','cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated;
GRANT ALL ON public.tasks TO service_role;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE INDEX tasks_assignee_idx ON public.tasks(assignee_id, status);
CREATE INDEX tasks_org_idx ON public.tasks(org_id, status);

CREATE POLICY "members can read tasks" ON public.tasks
  FOR SELECT TO authenticated
  USING (public.is_org_member(org_id, auth.uid()));

CREATE POLICY "members can create tasks" ON public.tasks
  FOR INSERT TO authenticated
  WITH CHECK (public.is_org_member(org_id, auth.uid()) AND assigner_id = auth.uid());

CREATE POLICY "assignee, assigner, or admin can update tasks" ON public.tasks
  FOR UPDATE TO authenticated
  USING (
    assignee_id = auth.uid()
    OR assigner_id = auth.uid()
    OR public.has_org_role(org_id, auth.uid(), 'admin')
  )
  WITH CHECK (public.is_org_member(org_id, auth.uid()));

CREATE POLICY "assigner or admin can delete tasks" ON public.tasks
  FOR DELETE TO authenticated
  USING (assigner_id = auth.uid() OR public.has_org_role(org_id, auth.uid(), 'admin'));

-- ---------- approval_requests ----------
CREATE TABLE public.approval_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  requester_id uuid NOT NULL,
  title text NOT NULL CHECK (length(title) BETWEEN 1 AND 200),
  rationale text,
  subject_type text CHECK (subject_type IN ('decision','report','goal','dashboard')),
  subject_id text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','cancelled')),
  decided_by uuid,
  decided_at timestamptz,
  decision_note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.approval_requests TO authenticated;
GRANT ALL ON public.approval_requests TO service_role;
ALTER TABLE public.approval_requests ENABLE ROW LEVEL SECURITY;

CREATE INDEX approvals_org_status_idx ON public.approval_requests(org_id, status, created_at DESC);

CREATE POLICY "members can read approvals" ON public.approval_requests
  FOR SELECT TO authenticated
  USING (public.is_org_member(org_id, auth.uid()));

CREATE POLICY "members can request approvals" ON public.approval_requests
  FOR INSERT TO authenticated
  WITH CHECK (public.is_org_member(org_id, auth.uid()) AND requester_id = auth.uid());

CREATE POLICY "admins can decide, requester can cancel" ON public.approval_requests
  FOR UPDATE TO authenticated
  USING (
    public.has_org_role(org_id, auth.uid(), 'admin')
    OR requester_id = auth.uid()
  )
  WITH CHECK (public.is_org_member(org_id, auth.uid()));

-- ---------- activity_events ----------
CREATE TABLE public.activity_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  actor_id uuid NOT NULL,
  verb text NOT NULL,
  subject_type text,
  subject_id text,
  summary text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.activity_events TO authenticated;
GRANT ALL ON public.activity_events TO service_role;
ALTER TABLE public.activity_events ENABLE ROW LEVEL SECURITY;

CREATE INDEX activity_org_idx ON public.activity_events(org_id, created_at DESC);

CREATE POLICY "members can read activity" ON public.activity_events
  FOR SELECT TO authenticated
  USING (public.is_org_member(org_id, auth.uid()));

CREATE POLICY "members can log activity" ON public.activity_events
  FOR INSERT TO authenticated
  WITH CHECK (public.is_org_member(org_id, auth.uid()) AND actor_id = auth.uid());

-- ---------- profiles: active_org_id ----------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS active_org_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL;

-- ---------- existing data: org_id columns ----------
ALTER TABLE public.metric_snapshots
  ADD COLUMN IF NOT EXISTS org_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.weekly_reports
  ADD COLUMN IF NOT EXISTS org_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.account_connections
  ADD COLUMN IF NOT EXISTS org_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;

-- ---------- updated_at triggers ----------
DROP TRIGGER IF EXISTS trg_orgs_updated_at ON public.organizations;
CREATE TRIGGER trg_orgs_updated_at BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_tasks_updated_at ON public.tasks;
CREATE TRIGGER trg_tasks_updated_at BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------- personal org bootstrap ----------
CREATE OR REPLACE FUNCTION public.ensure_personal_org(_user uuid, _name text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_org uuid;
  v_slug text;
BEGIN
  SELECT o.id INTO v_org
  FROM public.organizations o
  JOIN public.org_memberships m ON m.org_id = o.id
  WHERE o.is_personal AND m.user_id = _user
  LIMIT 1;

  IF v_org IS NOT NULL THEN RETURN v_org; END IF;

  v_slug := 'personal-' || substr(replace(_user::text, '-', ''), 1, 12);

  INSERT INTO public.organizations (name, slug, is_personal, created_by)
  VALUES (COALESCE(NULLIF(_name, ''), 'Personal workspace'), v_slug, true, _user)
  RETURNING id INTO v_org;

  INSERT INTO public.org_memberships (org_id, user_id, role)
  VALUES (v_org, _user, 'owner');

  UPDATE public.profiles SET active_org_id = COALESCE(active_org_id, v_org)
  WHERE id = _user;

  RETURN v_org;
END; $$;

-- Update handle_new_user to also create a personal org
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_name text;
BEGIN
  v_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name');
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, v_name)
  ON CONFLICT (id) DO NOTHING;

  PERFORM public.ensure_personal_org(
    NEW.id,
    COALESCE(v_name, split_part(NEW.email, '@', 1)) || '''s workspace'
  );

  RETURN NEW;
END; $$;

-- ---------- backfill existing users ----------
DO $$
DECLARE r record; v_org uuid;
BEGIN
  FOR r IN SELECT p.id, p.full_name FROM public.profiles p LOOP
    v_org := public.ensure_personal_org(r.id, COALESCE(r.full_name, 'Personal workspace'));
    UPDATE public.metric_snapshots  SET org_id = v_org WHERE user_id = r.id AND org_id IS NULL;
    UPDATE public.weekly_reports    SET org_id = v_org WHERE user_id = r.id AND org_id IS NULL;
    UPDATE public.account_connections SET org_id = v_org WHERE user_id = r.id AND org_id IS NULL;
  END LOOP;
END $$;

-- ---------- ensure auth trigger is wired ----------
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
