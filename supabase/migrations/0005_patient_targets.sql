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
