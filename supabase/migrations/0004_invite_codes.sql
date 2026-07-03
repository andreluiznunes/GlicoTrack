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
