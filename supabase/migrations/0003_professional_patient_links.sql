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
