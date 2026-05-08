drop function if exists public.check_lead_rate_limit(text, integer, integer);

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
