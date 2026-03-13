CREATE TABLE public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  endpoint text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_rate_limits_lookup ON public.rate_limits (identifier, endpoint, created_at);

-- Auto-cleanup old entries (older than 2 hours)
CREATE OR REPLACE FUNCTION public.cleanup_rate_limits()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.rate_limits WHERE created_at < now() - interval '2 hours';
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_cleanup_rate_limits
  AFTER INSERT ON public.rate_limits
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.cleanup_rate_limits();

-- RLS: only service role can access
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;