-- GlicoTrack — 0012: aprovação de profissionais por um administrador
-- Hoje qualquer pessoa pode se autodeclarar "profissional" no cadastro e já
-- sair gerando código de convite. A partir daqui, profissional nasce
-- "pending" e só pode agir depois que um admin aprovar.

-- 1) Colunas novas em profiles.
alter table public.profiles
  add column if not exists is_admin boolean not null default false,
  add column if not exists approval_status text not null default 'approved'
    check (approval_status in ('pending', 'approved', 'rejected'));

-- 2) Trigger: impede que o próprio usuário mude seu approval_status ou
-- is_admin via UPDATE direto (a RLS "dono edita o próprio registro",
-- profiles_update_own, sozinha não bloqueia isso). approval_status só pode
-- mudar via a RPC set_professional_approval (auth.uid() != old.id, já que é
-- o admin alterando o profissional) ou edição direta no SQL Editor
-- (auth.uid() é null nesse contexto). is_admin nunca muda por via
-- autenticada — só edição direta no SQL Editor.
create or replace function public.prevent_profile_privilege_self_change()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.approval_status <> old.approval_status and auth.uid() = old.id then
    raise exception 'Você não pode alterar seu próprio status de aprovação.';
  end if;

  if new.is_admin <> old.is_admin and auth.uid() is not null then
    raise exception 'Alterar is_admin não é permitido por essa via.';
  end if;

  return new;
end;
$$;

drop trigger if exists on_profiles_prevent_privilege_self_change on public.profiles;
create trigger on_profiles_prevent_privilege_self_change
  before update on public.profiles
  for each row execute function public.prevent_profile_privilege_self_change();

-- 3) handle_new_user: profissional nasce "pending", paciente nasce "approved".
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id, role, full_name, email, terms_accepted_at, approval_status)
  values (
    new.id,
    (new.raw_user_meta_data->>'role')::public.user_role,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    now(),
    case
      when (new.raw_user_meta_data->>'role') = 'professional' then 'pending'
      else 'approved'
    end
  );
  return new;
end;
$$;

-- 4) generate_invite_code: exige approval_status = 'approved', não só role.
create or replace function public.generate_invite_code(p_expires_in_hours integer default 72)
returns text
language plpgsql
security definer
-- gen_random_bytes vem do pgcrypto, que no Supabase fica instalado no schema
-- "extensions" (não em "public") — por isso search_path precisa incluí-lo.
set search_path = public, extensions, pg_temp
as $$
declare
  v_role public.user_role;
  v_approval text;
  v_code text;
begin
  select role, approval_status into v_role, v_approval
  from public.profiles where id = auth.uid();

  if v_role is distinct from 'professional' then
    raise exception 'Apenas profissionais podem gerar códigos de convite.';
  end if;

  if v_approval is distinct from 'approved' then
    raise exception 'Sua conta de profissional ainda não foi aprovada por um administrador.';
  end if;

  v_code := upper(encode(gen_random_bytes(6), 'hex'));

  insert into public.invite_codes (professional_id, code, expires_at)
  values (auth.uid(), v_code, now() + (p_expires_in_hours || ' hours')::interval);

  return v_code;
end;
$$;

revoke all on function public.generate_invite_code(integer) from public;
grant execute on function public.generate_invite_code(integer) to authenticated;

-- 5) patient_targets_insert/_update: defesa em profundidade — profissional
-- só grava meta se também estiver aprovado (cobre o caso de ser rejeitado
-- depois de já ter pacientes vinculados).
drop policy if exists "patient_targets_insert" on public.patient_targets;
create policy "patient_targets_insert" on public.patient_targets
  for insert with check (
    professional_id = auth.uid()
    and exists (
      select 1 from public.professional_patient_links l
      where l.professional_id = auth.uid() and l.patient_id = patient_targets.patient_id
    )
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.approval_status = 'approved'
    )
  );

drop policy if exists "patient_targets_update" on public.patient_targets;
create policy "patient_targets_update" on public.patient_targets
  for update using (
    professional_id = auth.uid()
    and exists (
      select 1 from public.professional_patient_links l
      where l.professional_id = auth.uid() and l.patient_id = patient_targets.patient_id
    )
  )
  with check (
    professional_id = auth.uid()
    and exists (
      select 1 from public.professional_patient_links l
      where l.professional_id = auth.uid() and l.patient_id = patient_targets.patient_id
    )
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.approval_status = 'approved'
    )
  );

-- 6) profiles: admin lê profissionais (pra tela de aprovação) — nada de
-- paciente, é só o que a tela precisa.
--
-- A checagem "sou admin?" precisa passar por uma função security definer
-- (current_user_is_admin), não por uma subquery direta em public.profiles
-- dentro do USING: uma subquery contra a MESMA tabela que a policy protege
-- faz o Postgres reavaliar todas as policies de profiles recursivamente
-- (incluindo essa mesma), o que ele detecta e recusa com "infinite
-- recursion detected in policy for relation profiles" (42P17) — a função
-- security definer bypassa RLS na consulta interna e quebra o ciclo.
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

-- 7) RPC: admin aprova/rejeita/revoga um profissional. Sem policy de UPDATE
-- direta em profiles pra admin — tudo passa por aqui (security definer),
-- mesmo padrão de generate_invite_code/redeem_invite_code.
create or replace function public.set_professional_approval(
  p_professional_id uuid,
  p_status text
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not exists (
    select 1 from public.profiles where id = auth.uid() and is_admin = true
  ) then
    raise exception 'Apenas administradores podem alterar a aprovação de profissionais.';
  end if;

  if p_status not in ('pending', 'approved', 'rejected') then
    raise exception 'Status inválido.';
  end if;

  update public.profiles
     set approval_status = p_status
   where id = p_professional_id
     and role = 'professional';
end;
$$;

revoke all on function public.set_professional_approval(uuid, text) from public;
grant execute on function public.set_professional_approval(uuid, text) to authenticated;
