-- GlicoTrack — 0008: funções e triggers

-- 1) Cria o profile automaticamente quando um usuário se cadastra no Supabase Auth.
-- role/full_name vêm de options.data no supabase.auth.signUp() (raw_user_meta_data).
-- Se "role" não for um valor válido do enum, o cast falha e o cadastro inteiro é
-- revertido — role é obrigatório por design, não um valor opcional com default.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id, role, full_name, email, terms_accepted_at)
  values (
    new.id,
    (new.raw_user_meta_data->>'role')::public.user_role,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    now()
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2) Impede que o próprio usuário troque seu role via UPDATE direto na tabela
-- (RLS de "dono edita o próprio registro" sozinha não bloqueia isso).
create or replace function public.prevent_role_change()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.role <> old.role then
    raise exception 'Alterar o papel (role) de um perfil não é permitido.';
  end if;
  return new;
end;
$$;

drop trigger if exists on_profiles_prevent_role_change on public.profiles;
create trigger on_profiles_prevent_role_change
  before update on public.profiles
  for each row execute function public.prevent_role_change();

-- 3) Garante que measurement_id (em doses/refeições/atividades) referencia uma
-- medição do MESMO paciente da linha — RLS não valida integridade cross-table.
create or replace function public.validate_measurement_patient()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_patient_id uuid;
begin
  if new.measurement_id is not null then
    select patient_id into v_patient_id
    from public.glucose_measurements
    where id = new.measurement_id;

    if v_patient_id is null or v_patient_id <> new.patient_id then
      raise exception 'measurement_id não pertence ao mesmo paciente.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists on_medication_doses_validate_measurement on public.medication_doses;
create trigger on_medication_doses_validate_measurement
  before insert or update on public.medication_doses
  for each row execute function public.validate_measurement_patient();

drop trigger if exists on_meals_validate_measurement on public.meals;
create trigger on_meals_validate_measurement
  before insert or update on public.meals
  for each row execute function public.validate_measurement_patient();

drop trigger if exists on_activities_validate_measurement on public.activities;
create trigger on_activities_validate_measurement
  before insert or update on public.activities
  for each row execute function public.validate_measurement_patient();

-- 4) RPC: profissional gera um código de convite (entropia real via gen_random_bytes,
-- não sequencial). Validade default de 72h.
create or replace function public.generate_invite_code(p_expires_in_hours integer default 72)
returns text
language plpgsql
security definer
set search_path = public, pg_temp
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

-- 5) RPC: paciente resgata um código e cria o vínculo com o profissional.
-- Atômico (UPDATE ... WHERE used_by is null RETURNING) para evitar corrida de
-- resgate duplicado do mesmo código; recusa se o paciente já tem vínculo ativo
-- (MVP é 1 profissional por paciente — desvincular antes de resgatar outro código).
create or replace function public.redeem_invite_code(p_code text)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_role public.user_role;
  v_professional_id uuid;
begin
  select role into v_role from public.profiles where id = auth.uid();

  if v_role is distinct from 'patient' then
    raise exception 'Apenas pacientes podem resgatar códigos de convite.';
  end if;

  if exists (select 1 from public.professional_patient_links where patient_id = auth.uid()) then
    raise exception 'Você já está vinculado a um profissional. Desvincule-se antes de resgatar um novo código.';
  end if;

  update public.invite_codes
     set used_by = auth.uid(), used_at = now()
   where code = p_code
     and used_by is null
     and (expires_at is null or expires_at > now())
  returning professional_id into v_professional_id;

  if v_professional_id is null then
    raise exception 'Código de convite inválido, expirado ou já utilizado.';
  end if;

  insert into public.professional_patient_links (professional_id, patient_id)
  values (v_professional_id, auth.uid());
end;
$$;

revoke all on function public.redeem_invite_code(text) from public;
grant execute on function public.redeem_invite_code(text) to authenticated;
