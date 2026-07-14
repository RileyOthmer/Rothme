
CREATE TABLE public.onboarding_sessions (
  user_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_step TEXT NOT NULL DEFAULT 'welcome',
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  analysis JSONB,
  connections JSONB NOT NULL DEFAULT '{}'::jsonb,
  brand JSONB NOT NULL DEFAULT '{}'::jsonb,
  ai_training JSONB NOT NULL DEFAULT '{}'::jsonb,
  marketing_plan JSONB,
  checklist JSONB NOT NULL DEFAULT '{}'::jsonb,
  plan_tier TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.onboarding_sessions TO authenticated;
GRANT ALL ON public.onboarding_sessions TO service_role;

ALTER TABLE public.onboarding_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_onboarding_session_select" ON public.onboarding_sessions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own_onboarding_session_insert" ON public.onboarding_sessions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_onboarding_session_update" ON public.onboarding_sessions
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER set_onboarding_sessions_updated_at
  BEFORE UPDATE ON public.onboarding_sessions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
