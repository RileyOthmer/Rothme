
CREATE TABLE public.media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_by uuid NOT NULL,
  kind text NOT NULL CHECK (kind IN ('image','video','gif','document')),
  url text NOT NULL,
  thumbnail_url text,
  filename text,
  mime_type text,
  size_bytes bigint,
  width int,
  height int,
  duration_seconds numeric,
  alt_text text,
  tags text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.media_assets TO authenticated;
GRANT ALL ON public.media_assets TO service_role;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org read media" ON public.media_assets FOR SELECT TO authenticated USING (public.is_org_member(org_id, auth.uid()));
CREATE POLICY "org insert media" ON public.media_assets FOR INSERT TO authenticated WITH CHECK (public.is_org_member(org_id, auth.uid()) AND created_by = auth.uid());
CREATE POLICY "org update media" ON public.media_assets FOR UPDATE TO authenticated USING (public.is_org_member(org_id, auth.uid()));
CREATE POLICY "org delete media" ON public.media_assets FOR DELETE TO authenticated USING (public.is_org_member(org_id, auth.uid()));

CREATE TABLE public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_by uuid NOT NULL,
  title text,
  body text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','scheduled','publishing','published','failed','archived')),
  campaign_id uuid,
  approval_status text NOT NULL DEFAULT 'none' CHECK (approval_status IN ('none','pending','approved','rejected')),
  tags text[] DEFAULT '{}',
  ai_meta jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.posts TO authenticated;
GRANT ALL ON public.posts TO service_role;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org read posts" ON public.posts FOR SELECT TO authenticated USING (public.is_org_member(org_id, auth.uid()));
CREATE POLICY "org insert posts" ON public.posts FOR INSERT TO authenticated WITH CHECK (public.is_org_member(org_id, auth.uid()) AND created_by = auth.uid());
CREATE POLICY "org update posts" ON public.posts FOR UPDATE TO authenticated USING (public.is_org_member(org_id, auth.uid()));
CREATE POLICY "org delete posts" ON public.posts FOR DELETE TO authenticated USING (public.is_org_member(org_id, auth.uid()));
CREATE TRIGGER posts_updated_at BEFORE UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX posts_org_status_idx ON public.posts (org_id, status);

CREATE TABLE public.post_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  platform_id text NOT NULL,
  body text NOT NULL DEFAULT '',
  media_ids uuid[] DEFAULT '{}',
  platform_meta jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (post_id, platform_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.post_variants TO authenticated;
GRANT ALL ON public.post_variants TO service_role;
ALTER TABLE public.post_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "variants via post" ON public.post_variants FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.posts p WHERE p.id = post_id AND public.is_org_member(p.org_id, auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM public.posts p WHERE p.id = post_id AND public.is_org_member(p.org_id, auth.uid())));
CREATE TRIGGER post_variants_updated_at BEFORE UPDATE ON public.post_variants FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.post_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  platform_id text NOT NULL,
  scheduled_at timestamptz NOT NULL,
  published_at timestamptz,
  external_url text,
  external_id text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','publishing','published','failed','cancelled')),
  error text,
  attempts int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.post_schedules TO authenticated;
GRANT ALL ON public.post_schedules TO service_role;
ALTER TABLE public.post_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "schedules via post" ON public.post_schedules FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.posts p WHERE p.id = post_id AND public.is_org_member(p.org_id, auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM public.posts p WHERE p.id = post_id AND public.is_org_member(p.org_id, auth.uid())));
CREATE TRIGGER post_schedules_updated_at BEFORE UPDATE ON public.post_schedules FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX post_schedules_pending_idx ON public.post_schedules (status, scheduled_at);

INSERT INTO public.plugin_registry (slug, name, description, category, version, declared_modules, manifest, is_official)
VALUES ('publishing', 'Publishing', 'Compose, schedule and publish content across every connected platform.', 'publishing', '1.0.0',
  ARRAY['composer','calendar','queue','media_library','approvals'],
  '{"core": true, "capabilities": {"composer": true, "calendar": true, "queue": true, "media_library": true, "approvals": true}}'::jsonb,
  true)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, manifest = EXCLUDED.manifest;
