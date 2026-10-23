CREATE TABLE public.claim_codes (
  code text PRIMARY KEY,
  spawn_id text NOT NULL,
  device_id text NOT NULL,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  accuracy double precision NOT NULL,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  wallet text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.claim_codes TO service_role;
ALTER TABLE public.claim_codes ENABLE ROW LEVEL SECURITY;
CREATE INDEX claim_codes_expires_idx ON public.claim_codes (expires_at);