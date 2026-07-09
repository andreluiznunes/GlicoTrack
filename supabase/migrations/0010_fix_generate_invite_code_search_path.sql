-- GlicoTrack — 0010: correção do search_path de generate_invite_code
-- gen_random_bytes (do pgcrypto) fica no schema "extensions" no Supabase, não
-- em "public" — a função original só buscava em public/pg_temp e falhava com
-- "function gen_random_bytes(integer) does not exist". Rode este arquivo se
-- você já aplicou o 0000_full_schema.sql/0008 antes desta correção.
create or replace function public.generate_invite_code(p_expires_in_hours integer default 72)
returns text
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_role public.user_role;
  v_code text;
begin
  select role into v_role from public.profiles where id = auth.uid();

  if v_role is distinct from 'professional' then
    raise exception 'Apenas profissionais podem gerar códigos de convite.';
  end if;

  v_code := upper(encode(gen_random_bytes(6), 'hex'));

  insert into public.invite_codes (professional_id, code, expires_at)
  values (auth.uid(), v_code, now() + (p_expires_in_hours || ' hours')::interval);

  return v_code;
end;
$$;

revoke all on function public.generate_invite_code(integer) from public;
grant execute on function public.generate_invite_code(integer) to authenticated;
