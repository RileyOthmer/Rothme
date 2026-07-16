-- 1. social_accounts: per-user connected social accounts
CREATE TABLE public.social_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform text NOT NULL,
  platform_account_id text,
  username text,
  display_name text,
  avatar_url text,
  encrypted_access_token text,
  encrypted_refresh_token text,
  token_expiration timestamptz,
  scopes text[] NOT NULL DEFAULT '{}',
  connection_status text NOT NULL DEFAULT 'connected'
    CHECK (connection_status IN ('connected','disconnected','needs_reauth','error','syncing')),
  last_error text,
  connected_at timestamptz NOT NULL DEFAULT now(),
  last_sync timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, platform, platform_account_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_accounts TO authenticated;
GRANT ALL ON public.social_accounts TO service_role;
ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own social accounts"
  ON public.social_accounts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX social_accounts_user_id_idx ON public.social_accounts (user_id);
CREATE INDEX social_accounts_platform_idx ON public.social_accounts (platform);

CREATE TRIGGER social_accounts_set_updated_at
  BEFORE UPDATE ON public.social_accounts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2. sync_history: per-connection sync attempts
CREATE TABLE public.sync_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  social_account_id uuid NOT NULL REFERENCES public.social_accounts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'analytics'
    CHECK (kind IN ('profile','analytics','posts','followers','engagement','impressions','video','full')),
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  success boolean,
  records_synced integer NOT NULL DEFAULT 0,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.sync_history TO authenticated;
GRANT ALL ON public.sync_history TO service_role;
ALTER TABLE public.sync_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read their own sync history"
  ON public.sync_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert their own sync history"
  ON public.sync_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX sync_history_account_idx ON public.sync_history (social_account_id, started_at DESC);
CREATE INDEX sync_history_user_idx ON public.sync_history (user_id, started_at DESC);

-- 3. oauth_states: short-lived CSRF/PKCE state for outbound OAuth
CREATE TABLE public.oauth_states (
  state text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform text NOT NULL,
  code_verifier text,
  redirect_after text,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '15 minutes')
);

GRANT SELECT, INSERT, DELETE ON public.oauth_states TO authenticated;
GRANT ALL ON public.oauth_states TO service_role;
ALTER TABLE public.oauth_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own oauth states"
  ON public.oauth_states FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
