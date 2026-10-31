ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spawns ENABLE ROW LEVEL SECURITY;
ALTER POLICY "places are publicly readable" ON public.places USING (false);
ALTER POLICY "spawns are publicly readable" ON public.spawns USING (false);
REVOKE ALL PRIVILEGES ON TABLE public.places, public.spawns FROM PUBLIC, anon, authenticated;
GRANT ALL PRIVILEGES ON TABLE public.places, public.spawns TO service_role;
COMMENT ON TABLE public.places IS 'DEPRECATED: retired CATCH data, unused by FAGENT. Public and authenticated API access disabled; records preserved.';
COMMENT ON TABLE public.spawns IS 'DEPRECATED: retired CATCH data, unused by FAGENT. Public and authenticated API access disabled; records preserved.';