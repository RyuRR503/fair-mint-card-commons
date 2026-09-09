-- Remap the existing store points onto the nine feed-backed tokenized stocks.
-- No new locations are added; only the stock each point pays out changes.
update public.places set symbol = case symbol
  when 'SBUXON' then 'FXION'
  when 'MCDON'  then 'AMDON'
  when 'BABAON' then 'MUON'
  when 'NIOON'  then 'NVDAON'
  when 'NKEON'  then 'MSFTON'
  when 'COSTON' then 'GOOGLON'
  else symbol end
where symbol in ('SBUXON','MCDON','BABAON','NIOON','NKEON','COSTON');

update public.spawns s set
  symbol = m.new_symbol,
  amount = m.amount,
  rarity = m.rarity,
  cooldown_min = m.cooldown
from (values
  ('SBUXON','FXION',  0.02,  'common', 20),
  ('MCDON', 'AMDON',  0.002, 'common', 20),
  ('BABAON','MUON',   0.001, 'common', 20),
  ('NIOON', 'NVDAON', 0.006, 'rare',   45),
  ('NKEON', 'MSFTON', 0.003, 'rare',   45),
  ('TSLAON','TSLAON', 0.004, 'rare',   45),
  ('AAPLON','AAPLON', 0.008, 'epic',   90),
  ('COSTON','GOOGLON',0.008, 'epic',   90)
) as m(old_symbol, new_symbol, amount, rarity, cooldown)
where s.symbol = m.old_symbol;

update public.legendary_events set symbol = 'SPCXON', code = 'SPCX-' || split_part(code, '-', 2)
where symbol = 'BILION';

create or replace function public.schedule_daily_legendary()
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
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
  order by random()
  limit 1;

  if p is null then
    return;
  end if;

  start_hour := 2 + floor(random() * 8)::int;
  start_min  := floor(random() * 60)::int;
  win_code := 'SPCX-' || upper(substr(md5(random()::text), 1, 4));

  insert into public.legendary_events
    (symbol, amount, place, city, lat, lng, starts_at, duration_min, radius_m, code)
  values (
    'SPCXON',
    1,
    p.name,
    p.city,
    p.lat,
    p.lng,
    date_trunc('day', now() + interval '1 day') + make_interval(hours => start_hour, mins => start_min),
    120,
    25,
    win_code
  );
end;
$function$;