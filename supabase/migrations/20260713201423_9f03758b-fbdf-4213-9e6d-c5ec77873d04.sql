
-- ============ platforms ============
CREATE TABLE public.platforms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  logo_url text,
  description text,
  category text,
  base_url text,
  api_version text,
  auth_type text NOT NULL DEFAULT 'none',
  authorization_url text,
  token_url text,
  refresh_url text,
  redirect_uri text,
  scopes text[] NOT NULL DEFAULT '{}',
  webhook_endpoint text,
  default_headers jsonb NOT NULL DEFAULT '{}'::jsonb,
  timeout_ms integer NOT NULL DEFAULT 10000,
  retry_count integer NOT NULL DEFAULT 0,
  rate_limit jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'needs_configuration',
  notes text,
  secrets_ciphertext text,
  enabled boolean NOT NULL DEFAULT false,
  verified boolean NOT NULL DEFAULT false,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.platforms TO authenticated;
GRANT ALL ON public.platforms TO service_role;
ALTER TABLE public.platforms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage platforms" ON public.platforms
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ endpoints ============
CREATE TABLE public.platform_endpoints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_id uuid NOT NULL REFERENCES public.platforms(id) ON DELETE CASCADE,
  name text NOT NULL,
  http_method text NOT NULL DEFAULT 'GET',
  path text NOT NULL DEFAULT '/',
  headers jsonb NOT NULL DEFAULT '{}'::jsonb,
  query_params jsonb NOT NULL DEFAULT '{}'::jsonb,
  body text,
  auth_override jsonb NOT NULL DEFAULT '{}'::jsonb,
  pagination jsonb NOT NULL DEFAULT '{}'::jsonb,
  rate_limit jsonb NOT NULL DEFAULT '{}'::jsonb,
  parser jsonb NOT NULL DEFAULT '{}'::jsonb,
  validation jsonb NOT NULL DEFAULT '{}'::jsonb,
  example_response jsonb,
  last_tested_at timestamptz,
  last_status integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.platform_endpoints (platform_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.platform_endpoints TO authenticated;
GRANT ALL ON public.platform_endpoints TO service_role;
ALTER TABLE public.platform_endpoints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage endpoints" ON public.platform_endpoints
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ field mappings (JSON path → Velora KPI) ============
CREATE TABLE public.platform_field_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_id uuid NOT NULL REFERENCES public.platforms(id) ON DELETE CASCADE,
  endpoint_id uuid REFERENCES public.platform_endpoints(id) ON DELETE SET NULL,
  velora_kpi text NOT NULL,
  json_path text NOT NULL DEFAULT '',
  data_type text NOT NULL DEFAULT 'number',
  category text,
  formatting text,
  aggregation text,
  calculation_formula text,
  display_name text,
  chart_type text,
  unit text,
  description text,
  example_value jsonb,
  validation jsonb NOT NULL DEFAULT '{}'::jsonb,
  confirmed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (platform_id, velora_kpi)
);
CREATE INDEX ON public.platform_field_mappings (platform_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.platform_field_mappings TO authenticated;
GRANT ALL ON public.platform_field_mappings TO service_role;
ALTER TABLE public.platform_field_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage field mappings" ON public.platform_field_mappings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ updated_at triggers ============
CREATE TRIGGER platforms_set_updated_at BEFORE UPDATE ON public.platforms
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER platform_endpoints_set_updated_at BEFORE UPDATE ON public.platform_endpoints
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER platform_field_mappings_set_updated_at BEFORE UPDATE ON public.platform_field_mappings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
