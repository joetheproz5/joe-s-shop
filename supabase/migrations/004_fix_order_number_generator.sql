-- Keep order number generation independent of extension schemas. Supabase can
-- install pgcrypto outside public, which makes an unqualified gen_random_bytes
-- call fail inside database functions with a restricted search path.
create or replace function public.generate_order_number()
returns text
language sql
volatile
set search_path = ''
as $$
  select 'JOE-' || pg_catalog.to_char(pg_catalog.now(), 'YYMMDD') || '-' ||
         pg_catalog.upper(pg_catalog.substr(pg_catalog.md5(
           pg_catalog.random()::text ||
           pg_catalog.clock_timestamp()::text ||
           pg_catalog.txid_current()::text
         ), 1, 8))
$$;
