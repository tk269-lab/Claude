-- ─────────────────────────────────────────────────────────────
--  ZANOVO — Supabase SQL Migration
--  Run this once in: Supabase Dashboard → SQL Editor → New Query
-- ─────────────────────────────────────────────────────────────

-- 1. Create the leads table
create table if not exists public.leads (
  id          uuid          default gen_random_uuid() primary key,
  name        text          not null,
  business    text          not null,
  email       text          not null,
  phone       text          not null,
  message     text,                          -- optional field
  created_at  timestamptz   default now()    not null
);

-- 2. Enable Row Level Security
alter table public.leads enable row level security;

-- 3. Public INSERT policy — lets the contact form save leads
--    (no login required to submit, matching how the form works)
create policy "Allow public inserts"
  on public.leads
  for insert
  with check (true);

-- 4. Authenticated SELECT policy — only you (logged-in admin) can read leads
create policy "Admin can read leads"
  on public.leads
  for select
  using (auth.role() = 'authenticated');

-- 5. Helpful index for sorting leads by newest first
create index if not exists leads_created_at_idx
  on public.leads (created_at desc);
