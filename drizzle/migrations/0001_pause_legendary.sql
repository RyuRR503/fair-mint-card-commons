CREATE OR REPLACE FUNCTION public.schedule_daily_legendary()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- Legendary events are paused until the owner opens them.
  RETURN;
END;
$$;
DELETE FROM public.legendary_events WHERE winner_wallet IS NULL AND starts_at + make_interval(mins => duration_min) > now();