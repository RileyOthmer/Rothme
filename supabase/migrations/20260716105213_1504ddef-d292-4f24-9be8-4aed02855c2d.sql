
CREATE TABLE public.business_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  business_summary text NOT NULL DEFAULT '',
  ideal_customer_profile jsonb NOT NULL DEFAULT '{}'::jsonb,
  recommended_channels jsonb NOT NULL DEFAULT '[]'::jsonb,
  strength_score integer NOT NULL DEFAULT 0,
  weakness_score integer NOT NULL DEFAULT 0,
  top_opportunities jsonb NOT NULL DEFAULT '[]'::jsonb,
  swot jsonb NOT NULL DEFAULT '{}'::jsonb,
  recommended_monthly_budget jsonb NOT NULL DEFAULT '{}'::jsonb,
  growth_potential jsonb NOT NULL DEFAULT '{}'::jsonb,
  confidence text NOT NULL DEFAULT 'medium',
  generated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.business_profiles TO authenticated;
GRANT ALL ON public.business_profiles TO service_role;

ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_business_profile_select" ON public.business_profiles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own_business_profile_insert" ON public.business_profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_business_profile_update" ON public.business_profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER business_profiles_updated_at
  BEFORE UPDATE ON public.business_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
