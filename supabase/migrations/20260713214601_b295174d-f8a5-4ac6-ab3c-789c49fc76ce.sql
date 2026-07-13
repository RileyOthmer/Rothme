
-- Plugin registry: the marketplace catalog. Admin-managed, readable by any authenticated user.
CREATE TABLE public.plugin_registry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  version text NOT NULL DEFAULT '1.0.0',
  developer text NOT NULL DEFAULT 'Velora',
  description text,
  category text,
  api_version text DEFAULT 'v1',
  declared_modules text[] NOT NULL DEFAULT '{}',
  declared_permissions text[] NOT NULL DEFAULT '{}',
  manifest jsonb NOT NULL DEFAULT '{}'::jsonb,
  icon text,
  docs_url text,
  is_official boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.plugin_registry TO authenticated;
GRANT ALL ON public.plugin_registry TO service_role;
ALTER TABLE public.plugin_registry ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read registry" ON public.plugin_registry FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin manage registry" ON public.plugin_registry FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER plugin_registry_touch BEFORE UPDATE ON public.plugin_registry
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Plugin installations: per-org install state.
CREATE TABLE public.plugin_installations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  plugin_slug text NOT NULL REFERENCES public.plugin_registry(slug) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'installed' CHECK (status IN ('installed','enabled','disabled')),
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  secrets_ciphertext text,
  enabled_modules text[] NOT NULL DEFAULT '{}',
  granted_permissions text[] NOT NULL DEFAULT '{}',
  verified boolean NOT NULL DEFAULT false,
  last_verified_at timestamptz,
  installed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, plugin_slug)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.plugin_installations TO authenticated;
GRANT ALL ON public.plugin_installations TO service_role;
ALTER TABLE public.plugin_installations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org read installs" ON public.plugin_installations FOR SELECT TO authenticated
  USING (public.is_org_member(org_id, auth.uid()));
CREATE POLICY "admin manage installs" ON public.plugin_installations FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER plugin_installations_touch BEFORE UPDATE ON public.plugin_installations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Plugin health: rolling metrics per installation.
CREATE TABLE public.plugin_health (
  installation_id uuid PRIMARY KEY REFERENCES public.plugin_installations(id) ON DELETE CASCADE,
  online boolean NOT NULL DEFAULT false,
  health_score integer NOT NULL DEFAULT 0 CHECK (health_score BETWEEN 0 AND 100),
  avg_latency_ms integer,
  rate_limit_remaining integer,
  last_success_at timestamptz,
  last_error_at timestamptz,
  last_error_message text,
  auth_ok boolean NOT NULL DEFAULT false,
  webhook_ok boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.plugin_health TO authenticated;
GRANT ALL ON public.plugin_health TO service_role;
ALTER TABLE public.plugin_health ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org read health" ON public.plugin_health FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.plugin_installations pi
          WHERE pi.id = plugin_health.installation_id AND public.is_org_member(pi.org_id, auth.uid()))
);
CREATE POLICY "admin manage health" ON public.plugin_health FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Plugin events: audit log.
CREATE TABLE public.plugin_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  installation_id uuid REFERENCES public.plugin_installations(id) ON DELETE CASCADE,
  plugin_slug text NOT NULL,
  event_type text NOT NULL,
  module text,
  success boolean,
  status_code integer,
  latency_ms integer,
  message text,
  payload jsonb,
  actor uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.plugin_events TO authenticated;
GRANT ALL ON public.plugin_events TO service_role;
ALTER TABLE public.plugin_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin read events" ON public.plugin_events FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX plugin_events_installation_idx ON public.plugin_events(installation_id, created_at DESC);
