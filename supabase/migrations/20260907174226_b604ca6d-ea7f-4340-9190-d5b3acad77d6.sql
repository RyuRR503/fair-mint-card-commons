CREATE TABLE public.places (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  osm_type text NOT NULL,
  osm_id bigint NOT NULL,
  symbol text NOT NULL,
  brand text NOT NULL,
  name text NOT NULL,
  city text NOT NULL,
  country text NOT NULL DEFAULT 'CN',
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (osm_type, osm_id)
);
CREATE INDEX places_city_idx ON public.places (city);
CREATE INDEX places_symbol_idx ON public.places (symbol);
CREATE INDEX places_latlng_idx ON public.places (lat, lng);

GRANT SELECT ON public.places TO anon;
GRANT SELECT ON public.places TO authenticated;
GRANT ALL ON public.places TO service_role;
ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;
CREATE POLICY "places are publicly readable" ON public.places FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.spawns (
  id text PRIMARY KEY,
  place_id uuid NOT NULL REFERENCES public.places(id) ON DELETE CASCADE,
  symbol text NOT NULL,
  amount numeric NOT NULL,
  rarity text NOT NULL DEFAULT 'common',
  day date NOT NULL,
  expires_at timestamptz NOT NULL,
  claimed_by text,
  claimed_at timestamptz,
  tx_hash text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (place_id, day)
);
CREATE INDEX spawns_day_idx ON public.spawns (day);
CREATE INDEX spawns_open_idx ON public.spawns (day, claimed_by);

GRANT SELECT ON public.spawns TO anon;
GRANT SELECT ON public.spawns TO authenticated;
GRANT ALL ON public.spawns TO service_role;
ALTER TABLE public.spawns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "spawns are publicly readable" ON public.spawns FOR SELECT TO anon, authenticated USING (true);