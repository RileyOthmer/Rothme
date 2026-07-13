
CREATE TABLE public.onboarding_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  anon_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  step_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX onboarding_events_anon_idx ON public.onboarding_events(anon_id);
CREATE INDEX onboarding_events_created_idx ON public.onboarding_events(created_at);
CREATE INDEX onboarding_events_type_idx ON public.onboarding_events(event_type);

GRANT INSERT ON public.onboarding_events TO authenticated;
GRANT ALL ON public.onboarding_events TO service_role;
ALTER TABLE public.onboarding_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated can insert onboarding events"
  ON public.onboarding_events FOR INSERT TO authenticated WITH CHECK (true);

CREATE TABLE public.onboarding_responses (
  anon_id TEXT NOT NULL PRIMARY KEY,
  user_type TEXT[] NOT NULL DEFAULT '{}',
  goals TEXT[] NOT NULL DEFAULT '{}',
  platforms TEXT[] NOT NULL DEFAULT '{}',
  cadence TEXT,
  frustrations TEXT[] NOT NULL DEFAULT '{}',
  ai_features TEXT[] NOT NULL DEFAULT '{}',
  connected_platforms TEXT[] NOT NULL DEFAULT '{}',
  country TEXT,
  timezone TEXT,
  device_type TEXT,
  referral_source TEXT,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT INSERT, UPDATE, SELECT ON public.onboarding_responses TO authenticated;
GRANT ALL ON public.onboarding_responses TO service_role;
ALTER TABLE public.onboarding_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated can insert onboarding responses"
  ON public.onboarding_responses FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated can update onboarding responses"
  ON public.onboarding_responses FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE TRIGGER onboarding_responses_updated
  BEFORE UPDATE ON public.onboarding_responses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
