CREATE TABLE public.test_wallets (wallet text PRIMARY KEY, created_at timestamptz NOT NULL DEFAULT now());
GRANT ALL ON public.test_wallets TO service_role;
ALTER TABLE public.test_wallets ENABLE ROW LEVEL SECURITY;
INSERT INTO public.test_wallets(wallet) VALUES ('0x27df7f97c14612db21a0064ad430d0e4b0fa930c');

CREATE OR REPLACE FUNCTION public.guard_catch_insert() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE point public.spawns%ROWTYPE; last_at timestamptz; wallet_count integer; point_count integer; at_time timestamptz := clock_timestamp();
BEGIN
  NEW.wallet := lower(NEW.wallet);
  PERFORM pg_advisory_xact_lock(hashtextextended('catch-wallet:' || NEW.wallet, 0));
  SELECT * INTO point FROM public.spawns WHERE id = NEW.spawn_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'CLAIM_POINT_MISSING'; END IF;
  NEW.created_at := at_time;
  IF EXISTS (SELECT 1 FROM public.test_wallets WHERE wallet = NEW.wallet) THEN RETURN NEW; END IF;
  IF point.respawn_at > at_time THEN RAISE EXCEPTION 'CLAIM_POINT_COOLDOWN'; END IF;
  IF point.rarity = 'legendary' THEN RAISE EXCEPTION 'CLAIM_LEGENDARY_PAUSED'; END IF;
  SELECT count(*), max(created_at) INTO wallet_count,last_at FROM public.catches WHERE wallet = NEW.wallet AND created_at > at_time - interval '24 hours';
  IF wallet_count >= 6 THEN RAISE EXCEPTION 'CLAIM_WALLET_DAY_LIMIT'; END IF;
  IF last_at > at_time - interval '120 minutes' THEN RAISE EXCEPTION 'CLAIM_WALLET_COOLDOWN'; END IF;
  IF EXISTS (SELECT 1 FROM public.catches WHERE wallet = NEW.wallet AND spawn_id = NEW.spawn_id AND created_at > at_time - interval '24 hours') THEN RAISE EXCEPTION 'CLAIM_POINT_REPEAT'; END IF;
  SELECT count(*) INTO point_count FROM public.catches WHERE spawn_id = NEW.spawn_id AND created_at > at_time - interval '24 hours';
  IF point_count >= 24 THEN RAISE EXCEPTION 'CLAIM_POINT_DAY_LIMIT'; END IF;
  UPDATE public.spawns SET claimed_by = NEW.wallet, claimed_at = at_time, respawn_at = at_time + make_interval(mins => point.cooldown_min), catches_count = catches_count + 1 WHERE id = NEW.spawn_id;
  RETURN NEW;
END; $$;