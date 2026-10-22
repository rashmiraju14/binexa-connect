create table if not exists public.community_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  discord_user_id text unique,
  discord_verified boolean not null default false,
  joined_at timestamptz not null default now()
);

alter table public.community_members enable row level security;
revoke all on public.community_members from anon, authenticated;
grant select on public.community_members to authenticated;
grant all on public.community_members to service_role;

drop policy if exists "Users can view their own membership" on public.community_members;
create policy "Users can view their own membership"
  on public.community_members for select to authenticated
  using ((select auth.uid()) = user_id);
