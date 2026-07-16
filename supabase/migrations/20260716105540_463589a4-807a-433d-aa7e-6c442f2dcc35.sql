
CREATE TABLE public.dashboard_insights (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  marketing_score integer NOT NULL DEFAULT 0,
  marketing_summary text NOT NULL DEFAULT '',
  seo_score integer NOT NULL DEFAULT 0,
  seo_summary text NOT NULL DEFAULT '',
  website_score integer NOT NULL DEFAULT 0,
  website_summary text NOT NULL DEFAULT '',
  social_presence_score integer NOT NULL DEFAULT 0,
  social_presence_summary text NOT NULL DEFAULT '',
  lead_generation_score integer NOT NULL DEFAULT 0,
  lead_generation_summary text NOT NULL DEFAULT '',
  paid_advertising_score integer NOT NULL DEFAULT 0,
  paid_advertising_summary text NOT NULL DEFAULT '',
  overall_health_score integer NOT NULL DEFAULT 0,
  overall_health_summary text NOT NULL DEFAULT '',
  recommendations jsonb NOT NULL DEFAULT '[]'::jsonb,
  confidence text NOT NULL DEFAULT 'medium',
  generated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.dashboard_insights TO authenticated;
GRANT ALL ON public.dashboard_insights TO service_role;

ALTER TABLE public.dashboard_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_dashboard_insights_select" ON public.dashboard_insights
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own_dashboard_insights_insert" ON public.dashboard_insights
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_dashboard_insights_update" ON public.dashboard_insights
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER dashboard_insights_updated_at
  BEFORE UPDATE ON public.dashboard_insights
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
