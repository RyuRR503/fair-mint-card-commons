CREATE TABLE public.behavior_flags (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  device_id text NOT NULL,
  wallet text,
  score integer NOT NULL,
  action text NOT NULL,
  reasons text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX behavior_flags_device_idx ON public.behavior_flags (device_id, created_at DESC);

GRANT ALL ON public.behavior_flags TO service_role;

ALTER TABLE public.behavior_flags ENABLE ROW LEVEL SECURITY;