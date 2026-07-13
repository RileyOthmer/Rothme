-- ============ Roles ============
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- Bootstrap: first caller becomes admin; after that requires an existing admin.
CREATE OR REPLACE FUNCTION public.claim_first_admin()
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE has_any boolean;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') INTO has_any;
  IF has_any THEN RETURN false; END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (auth.uid(), 'admin');
  RETURN true;
END; $$;

GRANT EXECUTE ON FUNCTION public.claim_first_admin() TO authenticated;

-- ============ Platform integrations ============
CREATE TABLE IF NOT EXISTS public.platform_integrations (
  platform text PRIMARY KEY,
  display_name text NOT NULL,
  enabled boolean NOT NULL DEFAULT false,
  verified boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'draft',        -- draft | tested | verified | error
  status_message text,
  -- Non-secret configuration
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
    -- shape: { redirect_uri, oauth_url, base_api_url, scopes, version,
    --          auth_method, http_method, endpoint_path, headers, query_params,
    --          body_template, pagination, retry, timeout_ms, rate_limit,
    --          rest_or_graphql, webhook_url, notes }
  -- Encrypted credentials blob (AES-256-GCM ciphertext, base64).
  secrets_ciphertext text,
  last_tested_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.platform_integrations TO authenticated;
GRANT ALL ON public.platform_integrations TO service_role;
ALTER TABLE public.platform_integrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage integrations" ON public.platform_integrations;
CREATE POLICY "Admins manage integrations"
  ON public.platform_integrations FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ KPI mappings ============
CREATE TABLE IF NOT EXISTS public.platform_kpi_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL REFERENCES public.platform_integrations(platform) ON DELETE CASCADE,
  internal_kpi text NOT NULL,              -- e.g. 'followers'
  external_field text NOT NULL,            -- e.g. 'data.follower_count'
  data_type text NOT NULL DEFAULT 'number',-- number | percent | currency | duration
  update_frequency text NOT NULL DEFAULT 'daily', -- realtime | hourly | daily | weekly
  description text,
  confirmed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (platform, internal_kpi)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.platform_kpi_mappings TO authenticated;
GRANT ALL ON public.platform_kpi_mappings TO service_role;
ALTER TABLE public.platform_kpi_mappings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage kpi mappings" ON public.platform_kpi_mappings;
CREATE POLICY "Admins manage kpi mappings"
  ON public.platform_kpi_mappings FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ Developer logs ============
CREATE TABLE IF NOT EXISTS public.platform_integration_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL,
  event_type text NOT NULL,                -- test | preview | auth | webhook | token_refresh | error | rate_limit | request
  success boolean,
  status_code int,
  message text,
  request jsonb,
  response jsonb,
  actor uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS platform_integration_logs_platform_ts_idx
  ON public.platform_integration_logs (platform, created_at DESC);

GRANT SELECT ON public.platform_integration_logs TO authenticated;
GRANT ALL ON public.platform_integration_logs TO service_role;
ALTER TABLE public.platform_integration_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins read logs" ON public.platform_integration_logs;
CREATE POLICY "Admins read logs"
  ON public.platform_integration_logs FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- updated_at trigger reuse
DROP TRIGGER IF EXISTS trg_platform_integrations_ua ON public.platform_integrations;
CREATE TRIGGER trg_platform_integrations_ua BEFORE UPDATE ON public.platform_integrations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_platform_kpi_mappings_ua ON public.platform_kpi_mappings;
CREATE TRIGGER trg_platform_kpi_mappings_ua BEFORE UPDATE ON public.platform_kpi_mappings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
