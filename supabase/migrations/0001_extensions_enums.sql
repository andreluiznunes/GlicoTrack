-- GlicoTrack — 0001: extensões e tipos base
-- Extensão necessária para gen_random_bytes() usado na geração de códigos de convite.
-- gen_random_uuid() já vem no core do Postgres 13+ usado pelo Supabase, não precisa de extensão.
create extension if not exists "pgcrypto";

do $$
begin
  create type public.user_role as enum ('patient', 'professional');
exception
  when duplicate_object then null;
end $$;
