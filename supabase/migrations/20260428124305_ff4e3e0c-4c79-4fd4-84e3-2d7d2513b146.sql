DROP POLICY IF EXISTS "anyone can insert revenue events" ON public.revenue_events;

CREATE OR REPLACE FUNCTION public.log_revenue_event(
  _source TEXT,
  _chain TEXT,
  _amount_usd NUMERIC,
  _wallet_hash TEXT DEFAULT NULL,
  _meta JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id UUID;
BEGIN
  IF _source NOT IN ('swap','buy') THEN
    RAISE EXCEPTION 'invalid source';
  END IF;
  IF _amount_usd IS NULL OR _amount_usd <= 0 OR _amount_usd > 1000000 THEN
    RAISE EXCEPTION 'invalid amount';
  END IF;
  IF _chain IS NULL OR length(_chain) > 12 THEN
    RAISE EXCEPTION 'invalid chain';
  END IF;

  INSERT INTO public.revenue_events (source, chain, amount_usd, wallet_hash, meta)
  VALUES (_source, _chain, _amount_usd, _wallet_hash, _meta)
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.log_revenue_event(TEXT, TEXT, NUMERIC, TEXT, JSONB) TO anon, authenticated;