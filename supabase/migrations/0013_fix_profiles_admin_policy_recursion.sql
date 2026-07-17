-- GlicoTrack — 0013: corrige recursão infinita na policy profiles_select_admin
-- A policy criada em 0012 fazia uma subquery direta em public.profiles
-- dentro do próprio USING de uma policy DE profiles — isso faz o Postgres
-- reavaliar as policies de profiles recursivamente (incluindo essa mesma) e
-- falhar com "infinite recursion detected in policy for relation profiles"
-- (42P17) em QUALQUER select em profiles, inclusive o de um usuário lendo o
-- próprio perfil — por isso o app inteiro parava de funcionar (loop de
-- redirecionamento). Rode este arquivo se já aplicou o 0012 antes desta
-- correção.
create or replace function public.current_user_is_admin()
returns boolean
language sql
security definer
stable
set search_path = public, pg_temp
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

drop policy if exists "profiles_select_admin" on public.profiles;
create policy "profiles_select_admin" on public.profiles
  for select using (
    role = 'professional' and public.current_user_is_admin()
  );
