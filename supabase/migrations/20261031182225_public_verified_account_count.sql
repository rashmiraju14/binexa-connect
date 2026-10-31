-- Expose only the aggregate required by the public community counter.
-- Definer access is intentional: callers cannot read individual auth.users rows.
create or replace function public.verified_account_count()
returns bigint
language sql
stable
security definer
set search_path = ''
as $$
  select count(*) from auth.users
  where email_confirmed_at is not null or phone_confirmed_at is not null;
$$;
revoke all on function public.verified_account_count() from public;
grant execute on function public.verified_account_count() to anon, authenticated, service_role;
