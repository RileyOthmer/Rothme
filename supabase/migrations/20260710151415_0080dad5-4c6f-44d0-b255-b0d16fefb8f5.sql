
CREATE TABLE public.metric_snapshots (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL,
  provider      text NOT NULL,
  metric        text NOT NULL,
  value         double precision NOT NULL,
  currency      char(3),
  period_start  timestamptz NOT NULL,
  granularity   text NOT NULL CHECK (granularity IN ('hour','day','week','month')),
  dimension_key text NOT NULL DEFAULT '',
  dimensions    jsonb NOT NULL DEFAULT '{}'::jsonb,
  confidence    real NOT NULL DEFAULT 1 CHECK (confidence >= 0 AND confidence <= 1),
  captured_at   timestamptz NOT NULL DEFAULT now(),
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Idempotency: a re-run of the same window collapses to the same row.
CREATE UNIQUE INDEX metric_snapshots_uniq
  ON public.metric_snapshots (user_id, provider, metric, dimension_key, period_start, granularity);

-- Primary read path: "give me these metrics for this user in this window".
CREATE INDEX metric_snapshots_read
  ON public.metric_snapshots (user_id, metric, period_start DESC);

CREATE INDEX metric_snapshots_by_provider
  ON public.metric_snapshots (user_id, provider, period_start DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.metric_snapshots TO authenticated;
GRANT ALL ON public.metric_snapshots TO service_role;

ALTER TABLE public.metric_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own metric snapshots"
  ON public.metric_snapshots
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
