
-- Brand Assets: one row per org with colors + fonts + file pointers.
CREATE TABLE public.brand_assets (
  org_id uuid PRIMARY KEY REFERENCES public.organizations(id) ON DELETE CASCADE,
  logo_path text,
  guidelines_path text,
  colors jsonb NOT NULL DEFAULT '[]'::jsonb,
  fonts jsonb NOT NULL DEFAULT '[]'::jsonb,
  image_paths text[] NOT NULL DEFAULT ARRAY[]::text[],
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.brand_assets TO authenticated;
GRANT ALL ON public.brand_assets TO service_role;

ALTER TABLE public.brand_assets ENABLE ROW LEVEL SECURITY;

-- Any member of the org can read/write their org's brand assets row.
CREATE POLICY "Org members can read brand assets"
  ON public.brand_assets FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.org_memberships m
    WHERE m.org_id = brand_assets.org_id AND m.user_id = auth.uid()
  ));

CREATE POLICY "Org members can insert brand assets"
  ON public.brand_assets FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.org_memberships m
    WHERE m.org_id = brand_assets.org_id AND m.user_id = auth.uid()
  ));

CREATE POLICY "Org members can update brand assets"
  ON public.brand_assets FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.org_memberships m
    WHERE m.org_id = brand_assets.org_id AND m.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.org_memberships m
    WHERE m.org_id = brand_assets.org_id AND m.user_id = auth.uid()
  ));

CREATE TRIGGER brand_assets_set_updated_at
  BEFORE UPDATE ON public.brand_assets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
