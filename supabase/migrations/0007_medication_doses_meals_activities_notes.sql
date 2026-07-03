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
