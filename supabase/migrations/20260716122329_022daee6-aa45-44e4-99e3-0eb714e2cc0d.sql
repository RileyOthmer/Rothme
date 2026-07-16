CREATE TABLE public.ai_audits (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  website_score int NOT NULL DEFAULT 0,
  seo_score int NOT NULL DEFAULT 0,
  speed_score int NOT NULL DEFAULT 0,
  mobile_score int NOT NULL DEFAULT 0,
  social_score int NOT NULL DEFAULT 0,
  business_info_score int NOT NULL DEFAULT 0,
  overall_score int NOT NULL DEFAULT 0,
  summary text NOT NULL DEFAULT '',
  recommendations jsonb NOT NULL DEFAULT '[]'::jsonb,
  category_summaries jsonb NOT NULL DEFAULT '{}'::jsonb,
  confidence text NOT NULL DEFAULT 'medium',
  generated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_audits TO authenticated;
GRANT ALL ON public.ai_audits TO service_role;

ALTER TABLE public.ai_audits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_ai_audit_select" ON public.ai_audits FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own_ai_audit_insert" ON public.ai_audits FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_ai_audit_update" ON public.ai_audits FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER ai_audits_set_updated_at BEFORE UPDATE ON public.ai_audits
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();