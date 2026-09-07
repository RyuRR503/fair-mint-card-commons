CREATE TABLE public.catches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet text NOT NULL,
  device_id text,
  spawn_id text NOT NULL,
  symbol text NOT NULL,
  amount numeric NOT NULL,
  city text NOT NULL,
  place text NOT NULL,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  accuracy double precision NOT NULL,
  mode text NOT NULL DEFAULT 'demo',
  tx_hash text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX catches_wallet_idx ON public.catches (wallet, created_at DESC);
CREATE INDEX catches_spawn_idx ON public.catches (spawn_id, created_at DESC);
GRANT ALL ON public.catches TO service_role;
ALTER TABLE public.catches ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.position_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet text,
  device_id text,
  city text NOT NULL,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  accuracy double precision NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX position_log_wallet_idx ON public.position_log (wallet, created_at DESC);
CREATE INDEX position_log_device_idx ON public.position_log (device_id, created_at DESC);
GRANT ALL ON public.position_log TO service_role;
ALTER TABLE public.position_log ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.legendary_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text NOT NULL,
  amount numeric NOT NULL,
  place text NOT NULL,
  city text NOT NULL,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  starts_at timestamptz NOT NULL,
  duration_min integer NOT NULL DEFAULT 60,
  radius_m integer NOT NULL DEFAULT 25,
  code text NOT NULL,
  winner_wallet text,
  tx_hash text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.legendary_events TO service_role;
ALTER TABLE public.legendary_events ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  kind text NOT NULL DEFAULT 'walker',
  city text,
  company text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX waitlist_email_kind_idx ON public.waitlist (lower(email), kind);
GRANT ALL ON public.waitlist TO service_role;
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;