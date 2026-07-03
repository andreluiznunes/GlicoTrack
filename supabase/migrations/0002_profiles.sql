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
