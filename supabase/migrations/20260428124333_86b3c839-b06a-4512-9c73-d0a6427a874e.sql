REVOKE EXECUTE ON FUNCTION public.log_revenue_event(TEXT, TEXT, NUMERIC, TEXT, JSONB) FROM anon, authenticated, public;
DROP FUNCTION IF EXISTS public.log_revenue_event(TEXT, TEXT, NUMERIC, TEXT, JSONB);

-- Add a stub SELECT policy so the table isn't "RLS enabled with no policy".
-- Nobody can read; only the service role (used by the edge function) bypasses RLS.
CREATE POLICY "no client reads"
  ON public.revenue_events
  FOR SELECT
  TO anon, authenticated
  USING (false);