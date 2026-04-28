CREATE TABLE public.revenue_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source TEXT NOT NULL CHECK (source IN ('swap','buy')),
  chain TEXT NOT NULL,
  amount_usd NUMERIC(18,6) NOT NULL,
  wallet_hash TEXT,
  meta JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.revenue_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone can insert revenue events"
  ON public.revenue_events
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE INDEX idx_revenue_events_created_at ON public.revenue_events (created_at DESC);
CREATE INDEX idx_revenue_events_source ON public.revenue_events (source);