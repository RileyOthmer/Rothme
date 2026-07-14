-- Social Integration Framework — persistence layer.
-- Tables:
--   social_connections : encrypted OAuth tokens + health/status per org+platform
--   social_events      : structured audit/log stream for the framework

CREATE TABLE public.social_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  platform text NOT NULL,
  external_account_id text,
  external_handle text,
  tokens_ciphertext text NOT NULL,
  status text NOT NULL DEFAULT 'connected',
  health_score int NOT NULL DEFAULT 100,
  health_updated_at timestamptz NOT NULL DEFAULT now(),
  last_synced_at timestamptz,
  last_error_kind text,
  last_error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, platform, external_account_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_connections TO authenticated;
GRANT ALL ON public.social_connections TO service_role;

ALTER TABLE public.social_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can read social connections"
  ON public.social_connections FOR SELECT TO authenticated
  USING (public.is_org_member(org_id, auth.uid()));

CREATE POLICY "Org members can insert social connections"
  ON public.social_connections FOR INSERT TO authenticated
  WITH CHECK (public.is_org_member(org_id, auth.uid()) AND auth.uid() = user_id);

CREATE POLICY "Org members can update social connections"
  ON public.social_connections FOR UPDATE TO authenticated
  USING (public.is_org_member(org_id, auth.uid()));

CREATE POLICY "Org members can delete social connections"
  ON public.social_connections FOR DELETE TO authenticated
  USING (public.is_org_member(org_id, auth.uid()));

CREATE TRIGGER trg_social_connections_updated_at
  BEFORE UPDATE ON public.social_connections
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_social_connections_org ON public.social_connections(org_id);
CREATE INDEX idx_social_connections_platform ON public.social_connections(platform);

-- Audit / structured log stream for the social framework.
CREATE TABLE public.social_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  connection_id uuid REFERENCES public.social_connections(id) ON DELETE SET NULL,
  platform text,
  level text NOT NULL DEFAULT 'info',
  scope text NOT NULL DEFAULT 'social',
  event text NOT NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  request_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.social_events TO authenticated;
GRANT ALL ON public.social_events TO service_role;

ALTER TABLE public.social_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can read social events"
  ON public.social_events FOR SELECT TO authenticated
  USING (org_id IS NULL OR public.is_org_member(org_id, auth.uid()));

CREATE INDEX idx_social_events_org_created ON public.social_events(org_id, created_at DESC);
CREATE INDEX idx_social_events_connection ON public.social_events(connection_id);