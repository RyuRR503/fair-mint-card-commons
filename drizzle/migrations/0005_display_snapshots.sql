CREATE TABLE public.display_snapshots (
  key text PRIMARY KEY,
  payload jsonb NOT NULL,
  built_at timestamptz NOT NULL DEFAULT now(),
  lease_until timestamptz NOT NULL DEFAULT 'epoch'
);
GRANT ALL ON public.display_snapshots TO service_role;
ALTER TABLE public.display_snapshots ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.claim_display_lease(_key text, _stale_seconds integer, _lease_seconds integer)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE won integer;
BEGIN
  INSERT INTO public.display_snapshots(key, payload, built_at, lease_until)
  VALUES (_key, 'null'::jsonb, 'epoch', now() + make_interval(secs => _lease_seconds))
  ON CONFLICT (key) DO UPDATE SET lease_until = now() + make_interval(secs => _lease_seconds)
  WHERE display_snapshots.lease_until < now() AND display_snapshots.built_at < now() - make_interval(secs => _stale_seconds);
  GET DIAGNOSTICS won = ROW_COUNT;
  RETURN won > 0;
END; $$;
REVOKE ALL ON FUNCTION public.claim_display_lease(text, integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_display_lease(text, integer, integer) TO service_role;