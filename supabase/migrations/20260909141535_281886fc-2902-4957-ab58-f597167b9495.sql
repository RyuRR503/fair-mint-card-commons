create or replace function public.schedule_daily_legendary()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  p record;
  start_hour int;
  start_min int;
  win_code text;
begin
  if exists (
    select 1 from public.legendary_events
    where starts_at >= date_trunc('day', now() + interval '1 day')
      and starts_at <  date_trunc('day', now() + interval '2 days')
  ) then
    return;
  end if;

  select name, city, lat, lng into p
  from public.places
  where symbol = 'SPCXON'
  order by random()
  limit 1;

  if p is null then
    select name, city, lat, lng into p
    from public.places
    order by random()
    limit 1;
  end if;

  if p is null then
    return;
  end if;

  start_hour := 2 + floor(random() * 8)::int;
  start_min  := floor(random() * 60)::int;
  win_code := 'SPCX-' || upper(substr(md5(random()::text), 1, 4));

  insert into public.legendary_events
    (symbol, amount, place, city, lat, lng, starts_at, duration_min, radius_m, code)
  values (
    'SPCXON', 1, p.name, p.city, p.lat, p.lng,
    date_trunc('day', now() + interval '1 day') + make_interval(hours => start_hour, mins => start_min),
    120, 25, win_code
  );
end;
$$;