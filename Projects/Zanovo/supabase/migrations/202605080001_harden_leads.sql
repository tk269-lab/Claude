-- Security hardening for public lead submissions.
-- Apply this before deploying the send-lead-email Edge Function.

create extension if not exists pgcrypto;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  business text not null,
  email text not null,
  phone text not null,
  message text,
  created_at timestamptz not null default now()
);

alter table public.leads
  add constraint leads_name_length check (char_length(name) between 1 and 120),
  add constraint leads_business_length check (char_length(business) between 1 and 160),
  add constraint leads_email_length check (char_length(email) between 3 and 254),
  add constraint leads_phone_length check (char_length(phone) between 7 and 40),
  add constraint leads_message_length check (message is null or char_length(message) <= 2000),
  add constraint leads_email_shape check (email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  add constraint leads_phone_shape check (phone ~ '^[+()0-9 .-]{7,40}$');

alter table public.leads enable row level security;
alter table public.leads force row level security;

drop policy if exists "Allow public lead submissions" on public.leads;
drop policy if exists "Public can insert leads" on public.leads;
drop policy if exists "Anon insert leads" on public.leads;
drop policy if exists "Anon read leads" on public.leads;
drop policy if exists "Anon update leads" on public.leads;
drop policy if exists "Anon delete leads" on public.leads;

revoke all on table public.leads from anon;
revoke all on table public.leads from authenticated;
grant insert on table public.leads to service_role;
grant select on table public.leads to service_role;

create table if not exists public.lead_rate_limits (
  identifier_hash text primary key,
  window_start timestamptz not null default now(),
  request_count integer not null default 1,
  updated_at timestamptz not null default now()
);

alter table public.lead_rate_limits enable row level security;
alter table public.lead_rate_limits force row level security;

revoke all on table public.lead_rate_limits from anon;
revoke all on table public.lead_rate_limits from authenticated;
grant select, insert, update on table public.lead_rate_limits to service_role;

create or replace function public.check_lead_rate_limit(
  p_identifier_hash text,
  p_max_requests integer default 5,
  p_window_seconds integer default 3600
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  current_record public.lead_rate_limits%rowtype;
  window_interval interval := make_interval(secs => p_window_seconds);
begin
  if p_identifier_hash is null or char_length(p_identifier_hash) < 32 then
    return false;
  end if;

  insert into public.lead_rate_limits as limits (identifier_hash, window_start, request_count, updated_at)
  values (p_identifier_hash, now(), 1, now())
  on conflict (identifier_hash) do update
    set
      window_start = case
        when limits.window_start < now() - window_interval then now()
        else limits.window_start
      end,
      request_count = case
        when limits.window_start < now() - window_interval then 1
        else limits.request_count + 1
      end,
      updated_at = now()
  returning * into current_record;

  return current_record.request_count <= p_max_requests;
end;
$$;

revoke all on function public.check_lead_rate_limit(text, integer, integer) from public;
grant execute on function public.check_lead_rate_limit(text, integer, integer) to service_role;
