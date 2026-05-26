-- ============================================================
-- Zanovo: profiles table
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

create table if not exists public.profiles (
  id                  uuid references auth.users on delete cascade primary key,
  full_name           text not null,
  business_name       text not null,
  phone               text not null,
  phone_country       text not null default 'ZA',
  billing_address     text,
  billing_city        text,
  billing_province    text,
  billing_postal_code text,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

-- Row-level security: users can only read/write their own row
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- ============================================================
-- IMPORTANT: Disable email confirmation for smooth UX
-- In Supabase Dashboard → Authentication → Settings:
--   Turn OFF "Enable email confirmations"
-- (You can re-enable this later once you go fully live)
-- ============================================================
