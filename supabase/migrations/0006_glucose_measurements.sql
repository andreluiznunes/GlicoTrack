-- GlicoTrack — 0006: registro principal de medição de glicemia
-- context como text + check (em vez de enum Postgres) para facilitar evoluir as opções depois.
create table if not exists public.glucose_measurements (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles(id) on delete cascade,
  value_mg_dl integer not null check (value_mg_dl > 0 and value_mg_dl < 1000),
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
