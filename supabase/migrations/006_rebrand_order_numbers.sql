-- Use the The Tech Shelf prefix for all newly generated order numbers.
create or replace function public.generate_order_number()
returns text
language sql
volatile
set search_path = pg_catalog, public
as $$
  select 'TTS-' || pg_catalog.to_char(pg_catalog.now(), 'YYMMDD') || '-' ||
    upper(substr(md5(pg_catalog.random()::text || pg_catalog.clock_timestamp()::text), 1, 6));
$$;
