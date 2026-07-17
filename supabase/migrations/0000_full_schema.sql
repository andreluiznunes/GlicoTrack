-- GlicoTrack — schema completo (concatenação de 0001..0013)
-- Gerado automaticamente: não editar diretamente, editar os arquivos numerados e reconcatenar.

-- ============================================================
-- 0001_extensions_enums.sql
-- ============================================================
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


-- ============================================================
-- 0002_profiles.sql
-- ============================================================
-- GlicoTrack — 0002: profiles
-- Um profile por usuário do Supabase Auth. role é autodeclarado no cadastro
-- (decisão de MVP para clínica única) e travado contra alteração posterior
-- pela trigger prevent_role_change (ver 0008).
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null,
  full_name text not null,
  email text not null,
  terms_accepted_at timestamptz not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;


-- ============================================================
-- 0003_professional_patient_links.sql
-- ============================================================
-- GlicoTrack — 0003: vínculo paciente-profissional
-- MVP: 1 profissional ativo por paciente (unique em patient_id).
-- Sem policy de INSERT direta: o vínculo só é criado pela RPC redeem_invite_code (ver 0008/0009).
create table if not exists public.professional_patient_links (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.profiles(id) on delete cascade,
  patient_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (patient_id)
);

create index if not exists idx_ppl_professional_id on public.professional_patient_links(professional_id);
create index if not exists idx_ppl_patient_id on public.professional_patient_links(patient_id);

alter table public.professional_patient_links enable row level security;


-- ============================================================
-- 0004_invite_codes.sql
-- ============================================================
-- GlicoTrack — 0004: códigos de convite
-- Gerados e resgatados só via RPC (generate_invite_code / redeem_invite_code, ver 0008),
-- nunca por INSERT direto do client.
create table if not exists public.invite_codes (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.profiles(id) on delete cascade,
  code text not null unique,
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  used_by uuid references public.profiles(id),
  used_at timestamptz
);

create index if not exists idx_invite_codes_professional_id on public.invite_codes(professional_id);

alter table public.invite_codes enable row level security;


-- ============================================================
-- 0005_patient_targets.sql
-- ============================================================
-- GlicoTrack — 0005: metas/faixas de referência por paciente, definidas pelo profissional
create table if not exists public.patient_targets (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles(id) on delete cascade,
  professional_id uuid not null references public.profiles(id) on delete cascade,
  min_mg_dl integer not null check (min_mg_dl > 0),
  max_mg_dl integer not null check (max_mg_dl > min_mg_dl),
  notes text,
  updated_at timestamptz not null default now(),
  unique (patient_id, professional_id)
);

create index if not exists idx_patient_targets_patient_id on public.patient_targets(patient_id);

alter table public.patient_targets enable row level security;


-- ============================================================
-- 0006_glucose_measurements.sql
-- ============================================================
-- GlicoTrack — 0006: registro principal de medição de glicemia
-- context como text + check (em vez de enum Postgres) para facilitar evoluir as opções depois.
create table if not exists public.glucose_measurements (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles(id) on delete cascade,
  value_mg_dl integer not null check (value_mg_dl > 0 and value_mg_dl <= 3000),
  measured_at timestamptz not null,
  context text not null check (context in (
    'jejum',
    'antes_cafe', 'antes_almoco', 'antes_jantar',
    'depois_cafe_2h', 'depois_almoco_2h', 'depois_jantar_2h',
    'antes_dormir', 'madrugada', 'outro'
  )),
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_glucose_measurements_patient_id on public.glucose_measurements(patient_id);
create index if not exists idx_glucose_measurements_patient_measured_at on public.glucose_measurements(patient_id, measured_at desc);

alter table public.glucose_measurements enable row level security;


-- ============================================================
-- 0007_medication_doses_meals_activities_notes.sql
-- ============================================================
-- GlicoTrack — 0007: dados complementares (doses, refeições, atividades, notas livres)
-- measurement_id é opcional (dado pode ser associado ao dia, sem uma medição específica).
-- A integridade "measurement_id pertence ao mesmo patient_id" é garantida por trigger (ver 0008),
-- pois RLS/FK não cobrem isso.
create table if not exists public.medication_doses (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles(id) on delete cascade,
  measurement_id uuid references public.glucose_measurements(id) on delete set null,
  taken_at timestamptz not null,
  medication_name text not null,
  dose_amount numeric not null check (dose_amount > 0),
  dose_unit text not null default 'UI',
  created_at timestamptz not null default now()
);

create table if not exists public.meals (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles(id) on delete cascade,
  measurement_id uuid references public.glucose_measurements(id) on delete set null,
  consumed_at timestamptz not null,
  description text not null,
  carbs_grams numeric check (carbs_grams >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles(id) on delete cascade,
  measurement_id uuid references public.glucose_measurements(id) on delete set null,
  performed_at timestamptz not null,
  description text not null,
  duration_minutes integer check (duration_minutes > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.patient_notes (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles(id) on delete cascade,
  noted_at timestamptz not null default now(),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_medication_doses_patient_id on public.medication_doses(patient_id);
create index if not exists idx_meals_patient_id on public.meals(patient_id);
create index if not exists idx_activities_patient_id on public.activities(patient_id);
create index if not exists idx_patient_notes_patient_id on public.patient_notes(patient_id);

alter table public.medication_doses enable row level security;
alter table public.meals enable row level security;
alter table public.activities enable row level security;
alter table public.patient_notes enable row level security;


-- ============================================================
-- 0008_functions_triggers.sql
-- ============================================================
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
-- gen_random_bytes vem do pgcrypto, que no Supabase fica instalado no schema
-- "extensions" (não em "public") — por isso search_path precisa incluí-lo.
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


-- ============================================================
-- 0009_rls_policies.sql
-- ============================================================
-- GlicoTrack — 0009: políticas de RLS
-- Convenção: paciente CRUD nos próprios dados clínicos; profissional só SELECT
-- nos dados de pacientes vinculados (exceto patient_targets, que ele define).

-- profiles ------------------------------------------------------------
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (id = auth.uid());

drop policy if exists "profiles_select_linked_professional_reads_patient" on public.profiles;
create policy "profiles_select_linked_professional_reads_patient" on public.profiles
  for select using (
    exists (
      select 1 from public.professional_patient_links l
      where l.patient_id = profiles.id and l.professional_id = auth.uid()
    )
  );

drop policy if exists "profiles_select_linked_patient_reads_professional" on public.profiles;
create policy "profiles_select_linked_patient_reads_professional" on public.profiles
  for select using (
    exists (
      select 1 from public.professional_patient_links l
      where l.professional_id = profiles.id and l.patient_id = auth.uid()
    )
  );

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- professional_patient_links -------------------------------------------
-- Sem policy de INSERT: vínculo só é criado pela RPC redeem_invite_code (security definer).
drop policy if exists "ppl_select_own" on public.professional_patient_links;
create policy "ppl_select_own" on public.professional_patient_links
  for select using (professional_id = auth.uid() or patient_id = auth.uid());

drop policy if exists "ppl_delete_own" on public.professional_patient_links;
create policy "ppl_delete_own" on public.professional_patient_links
  for delete using (professional_id = auth.uid() or patient_id = auth.uid());

-- invite_codes -----------------------------------------------------------
-- Sem policy de INSERT/UPDATE: geração e resgate só via RPC (security definer).
drop policy if exists "invite_codes_select_own" on public.invite_codes;
create policy "invite_codes_select_own" on public.invite_codes
  for select using (professional_id = auth.uid());

-- patient_targets ----------------------------------------------------------
drop policy if exists "patient_targets_select" on public.patient_targets;
create policy "patient_targets_select" on public.patient_targets
  for select using (patient_id = auth.uid() or professional_id = auth.uid());

drop policy if exists "patient_targets_insert" on public.patient_targets;
create policy "patient_targets_insert" on public.patient_targets
  for insert with check (
    professional_id = auth.uid()
    and exists (
      select 1 from public.professional_patient_links l
      where l.professional_id = auth.uid() and l.patient_id = patient_targets.patient_id
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
  );

-- glucose_measurements -------------------------------------------------
drop policy if exists "glucose_measurements_select" on public.glucose_measurements;
create policy "glucose_measurements_select" on public.glucose_measurements
  for select using (
    patient_id = auth.uid()
    or exists (
      select 1 from public.professional_patient_links l
      where l.professional_id = auth.uid() and l.patient_id = glucose_measurements.patient_id
    )
  );

drop policy if exists "glucose_measurements_insert" on public.glucose_measurements;
create policy "glucose_measurements_insert" on public.glucose_measurements
  for insert with check (patient_id = auth.uid());

drop policy if exists "glucose_measurements_update" on public.glucose_measurements;
create policy "glucose_measurements_update" on public.glucose_measurements
  for update using (patient_id = auth.uid()) with check (patient_id = auth.uid());

drop policy if exists "glucose_measurements_delete" on public.glucose_measurements;
create policy "glucose_measurements_delete" on public.glucose_measurements
  for delete using (patient_id = auth.uid());

-- medication_doses -----------------------------------------------------
drop policy if exists "medication_doses_select" on public.medication_doses;
create policy "medication_doses_select" on public.medication_doses
  for select using (
    patient_id = auth.uid()
    or exists (
      select 1 from public.professional_patient_links l
      where l.professional_id = auth.uid() and l.patient_id = medication_doses.patient_id
    )
  );

drop policy if exists "medication_doses_insert" on public.medication_doses;
create policy "medication_doses_insert" on public.medication_doses
  for insert with check (patient_id = auth.uid());

drop policy if exists "medication_doses_update" on public.medication_doses;
create policy "medication_doses_update" on public.medication_doses
  for update using (patient_id = auth.uid()) with check (patient_id = auth.uid());

drop policy if exists "medication_doses_delete" on public.medication_doses;
create policy "medication_doses_delete" on public.medication_doses
  for delete using (patient_id = auth.uid());

-- meals ------------------------------------------------------------------
drop policy if exists "meals_select" on public.meals;
create policy "meals_select" on public.meals
  for select using (
    patient_id = auth.uid()
    or exists (
      select 1 from public.professional_patient_links l
      where l.professional_id = auth.uid() and l.patient_id = meals.patient_id
    )
  );

drop policy if exists "meals_insert" on public.meals;
create policy "meals_insert" on public.meals
  for insert with check (patient_id = auth.uid());

drop policy if exists "meals_update" on public.meals;
create policy "meals_update" on public.meals
  for update using (patient_id = auth.uid()) with check (patient_id = auth.uid());

drop policy if exists "meals_delete" on public.meals;
create policy "meals_delete" on public.meals
  for delete using (patient_id = auth.uid());

-- activities ---------------------------------------------------------------
drop policy if exists "activities_select" on public.activities;
create policy "activities_select" on public.activities
  for select using (
    patient_id = auth.uid()
    or exists (
      select 1 from public.professional_patient_links l
      where l.professional_id = auth.uid() and l.patient_id = activities.patient_id
    )
  );

drop policy if exists "activities_insert" on public.activities;
create policy "activities_insert" on public.activities
  for insert with check (patient_id = auth.uid());

drop policy if exists "activities_update" on public.activities;
create policy "activities_update" on public.activities
  for update using (patient_id = auth.uid()) with check (patient_id = auth.uid());

drop policy if exists "activities_delete" on public.activities;
create policy "activities_delete" on public.activities
  for delete using (patient_id = auth.uid());

-- patient_notes --------------------------------------------------------
drop policy if exists "patient_notes_select" on public.patient_notes;
create policy "patient_notes_select" on public.patient_notes
  for select using (
    patient_id = auth.uid()
    or exists (
      select 1 from public.professional_patient_links l
      where l.professional_id = auth.uid() and l.patient_id = patient_notes.patient_id
    )
  );

drop policy if exists "patient_notes_insert" on public.patient_notes;
create policy "patient_notes_insert" on public.patient_notes
  for insert with check (patient_id = auth.uid());

drop policy if exists "patient_notes_update" on public.patient_notes;
create policy "patient_notes_update" on public.patient_notes
  for update using (patient_id = auth.uid()) with check (patient_id = auth.uid());

drop policy if exists "patient_notes_delete" on public.patient_notes;
create policy "patient_notes_delete" on public.patient_notes
  for delete using (patient_id = auth.uid());


-- ============================================================
-- 0010_fix_generate_invite_code_search_path.sql
-- ============================================================
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


-- ============================================================
-- 0011_increase_max_glucose_value.sql
-- ============================================================
-- GlicoTrack — 0011: aumentar o limite máximo de value_mg_dl para 3000
-- Existem casos clínicos reais de glicemia acima de 1000 mg/dL (o limite
-- original era um sanity bound conservador demais). Rode este arquivo se você
-- já aplicou o schema antes desta correção.
alter table public.glucose_measurements
  drop constraint if exists glucose_measurements_value_mg_dl_check;

alter table public.glucose_measurements
  add constraint glucose_measurements_value_mg_dl_check
  check (value_mg_dl > 0 and value_mg_dl <= 3000);


-- ============================================================
-- 0012_professional_approval.sql
-- ============================================================
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


-- ============================================================
-- 0013_fix_profiles_admin_policy_recursion.sql
-- ============================================================
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


