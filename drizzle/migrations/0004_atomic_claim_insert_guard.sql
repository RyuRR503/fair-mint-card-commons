CREATE INDEX IF NOT EXISTS catches_wallet_created_idx ON public.catches (wallet, created_at DESC);
CREATE INDEX IF NOT EXISTS catches_spawn_created_idx ON public.catches (spawn_id, created_at DESC);
CREATE OR REPLACE FUNCTION public.guard_catch_insert() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE point public.spawns%ROWTYPE; last_at timestamptz; wallet_count integer; point_count integer; at_time timestamptz := clock_timestamp();
BEGIN
  NEW.wallet := lower(NEW.wallet);
  PERFORM pg_advisory_xact_lock(hashtextextended('catch-wallet:' || NEW.wallet, 0));
  SELECT * INTO point FROM public.spawns WHERE id = NEW.spawn_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'CLAIM_POINT_MISSING'; END IF;
  IF point.respawn_at > at_time THEN RAISE EXCEPTION 'CLAIM_POINT_COOLDOWN'; END IF;
  IF point.rarity = 'legendary' THEN RAISE EXCEPTION 'CLAIM_LEGENDARY_PAUSED'; END IF;
  SELECT count(*), max(created_at) INTO wallet_count,last_at FROM public.catches WHERE wallet = NEW.wallet AND created_at > at_time - interval '24 hours';
  IF wallet_count >= 6 THEN RAISE EXCEPTION 'CLAIM_WALLET_DAY_LIMIT'; END IF;
  IF last_at > at_time - interval '120 minutes' THEN RAISE EXCEPTION 'CLAIM_WALLET_COOLDOWN'; END IF;
  IF EXISTS (SELECT 1 FROM public.catches WHERE wallet = NEW.wallet AND spawn_id = NEW.spawn_id AND created_at > at_time - interval '24 hours') THEN RAISE EXCEPTION 'CLAIM_POINT_REPEAT'; END IF;
  SELECT count(*) INTO point_count FROM public.catches WHERE spawn_id = NEW.spawn_id AND created_at > at_time - interval '24 hours';
  IF point_count >= 24 THEN RAISE EXCEPTION 'CLAIM_POINT_DAY_LIMIT'; END IF;
  NEW.created_at := at_time;
  UPDATE public.spawns SET claimed_by = NEW.wallet, claimed_at = at_time, respawn_at = at_time + make_interval(mins => point.cooldown_min), catches_count = catches_count + 1 WHERE id = NEW.spawn_id;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.guard_catch_insert() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER catch_insert_atomic_guard BEFORE INSERT ON public.catches FOR EACH ROW EXECUTE FUNCTION public.guard_catch_insert();