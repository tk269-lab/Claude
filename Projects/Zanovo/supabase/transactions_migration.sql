-- ============================================================
-- Zanovo: transactions table
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

create table if not exists public.transactions (
  id                   uuid default gen_random_uuid() primary key,
  user_id              uuid references auth.users on delete set null,
  paystack_reference   text unique not null,
  plan                 text not null,
  amount               integer not null,        -- in kobo (ZAR cents × 100)
  currency             text not null default 'ZAR',
  status               text not null default 'success',
  customer_email       text,
  customer_name        text,
  paid_at              timestamptz,
  created_at           timestamptz default now()
);

-- Row-level security
alter table public.transactions enable row level security;

-- Users can only view their own transactions
create policy "Users can view own transactions"
  on public.transactions for select
  using (auth.uid() = user_id);

-- Only the service role (Edge Function) can insert — no user-facing insert policy
-- The Edge Function uses the service role key, bypassing RLS entirely
