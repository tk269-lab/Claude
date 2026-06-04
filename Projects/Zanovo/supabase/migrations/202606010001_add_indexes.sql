-- Indexes for the most common query patterns.
-- Safe to run multiple times (IF NOT EXISTS).

-- transactions: every "view my payments" read filters on user_id (the RLS column)
create index if not exists idx_transactions_user_id
  on public.transactions (user_id);

-- transactions: reporting / recent-first listing
create index if not exists idx_transactions_created_at
  on public.transactions (created_at desc);

-- leads: report queries scan by submission date range
create index if not exists idx_leads_created_at
  on public.leads (created_at desc);

-- lead_rate_limits: window expiry housekeeping queries
create index if not exists idx_lead_rate_limits_window_start
  on public.lead_rate_limits (window_start);
