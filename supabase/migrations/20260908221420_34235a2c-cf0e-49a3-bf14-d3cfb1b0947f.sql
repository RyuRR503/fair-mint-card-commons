
-- switch from daily rolls to permanent spawns with cooldown respawn
ALTER TABLE public.spawns ADD COLUMN IF NOT EXISTS respawn_at timestamptz;
ALTER TABLE public.spawns ADD COLUMN IF NOT EXISTS cooldown_min integer NOT NULL DEFAULT 20;
ALTER TABLE public.spawns ADD COLUMN IF NOT EXISTS catches_count integer NOT NULL DEFAULT 0;
ALTER TABLE public.spawns ALTER COLUMN day DROP NOT NULL;
ALTER TABLE public.spawns ALTER COLUMN expires_at DROP NOT NULL;

DELETE FROM public.spawns;

ALTER TABLE public.spawns DROP CONSTRAINT IF EXISTS spawns_place_id_day_key;
CREATE UNIQUE INDEX IF NOT EXISTS spawns_place_id_key ON public.spawns (place_id);
CREATE INDEX IF NOT EXISTS spawns_respawn_at_idx ON public.spawns (respawn_at);
