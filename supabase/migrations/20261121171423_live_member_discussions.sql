-- Binexa Connect: authenticated community only. No seed posts or automatic administrators.
-- Intentionally independent of Discord's existing public.community_members table.
begin;
create schema if not exists discussion_private;
revoke all on schema discussion_private from public, anon, authenticated;
grant usage on schema discussion_private to authenticated;

create table public.discussion_profiles (
  id uuid primary key default gen_random_uuid(),
  display_name text not null check (char_length(display_name) between 2 and 60 and display_name !~ '[@<>[:cntrl:]]'),
  avatar_url text check (avatar_url is null or avatar_url ~ '^https://(lh3\.googleusercontent\.com|lh[4-6]\.googleusercontent\.com)/[^[:space:]]+$'),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table discussion_private.identities (
  user_id uuid primary key references auth.users(id) on delete cascade,
  profile_id uuid not null unique references public.discussion_profiles(id),
  is_admin boolean not null default false, restricted boolean not null default false
);
create table public.discussions (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.discussion_profiles(id),
  title text not null check (char_length(btrim(title)) between 5 and 150 and title !~ '<[^>]*>'),
  content text not null check (char_length(btrim(content)) between 1 and 10000 and content !~ '<[^>]*>'),
  category text not null check (category in ('General Community','Weight Management','GLP-1 Education','Longevity & Wellness','Men''s Health','Healthcare & Research','AI & Healthcare','Questions & Suggestions','Binexa Announcements')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  pinned boolean not null default false, locked boolean not null default false,
  status text not null default 'visible' check (status in ('visible','hidden'))
);
create table public.discussion_replies (
  id uuid primary key default gen_random_uuid(), discussion_id uuid not null references public.discussions(id) on delete cascade,
  author_id uuid not null references public.discussion_profiles(id), parent_id uuid,
  content text not null check (char_length(btrim(content)) between 1 and 5000 and content !~ '<[^>]*>'),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  status text not null default 'visible' check (status in ('visible','hidden')),
  unique(id, discussion_id),
  foreign key (parent_id, discussion_id) references public.discussion_replies(id, discussion_id) on delete set null (parent_id)
);
create table public.discussion_reactions (
  id uuid primary key default gen_random_uuid(), member_id uuid not null references public.discussion_profiles(id),
  discussion_id uuid references public.discussions(id) on delete cascade,
  reply_id uuid references public.discussion_replies(id) on delete cascade,
  reaction_type text not null default 'like' check (reaction_type = 'like'), created_at timestamptz not null default now(),
  check (num_nonnulls(discussion_id, reply_id) = 1)
);
create unique index discussion_unique_post_like on public.discussion_reactions(member_id, discussion_id) where discussion_id is not null;
create unique index discussion_unique_reply_like on public.discussion_reactions(member_id, reply_id) where reply_id is not null;
create table public.discussion_reports (
  id uuid primary key default gen_random_uuid(), reporter_id uuid not null references public.discussion_profiles(id),
  discussion_id uuid references public.discussions(id) on delete cascade,
  reply_id uuid references public.discussion_replies(id) on delete cascade,
  reason text not null check (char_length(btrim(reason)) between 5 and 1000 and reason !~ '<[^>]*>'),
  status text not null default 'open' check (status in ('open','resolved')),
  created_at timestamptz not null default now(), check (num_nonnulls(discussion_id, reply_id) = 1)
);
create unique index discussion_unique_post_report on public.discussion_reports(reporter_id, discussion_id) where discussion_id is not null and status='open';
create unique index discussion_unique_reply_report on public.discussion_reports(reporter_id, reply_id) where reply_id is not null and status='open';
create table discussion_private.requests (
  user_id uuid not null references auth.users(id) on delete cascade, request_id uuid not null,
  action text not null, fingerprint text not null, result jsonb not null,
  created_at timestamptz not null default clock_timestamp(), primary key(user_id, request_id)
);
create table discussion_private.moderation_log (
  id uuid primary key default gen_random_uuid(), actor_id uuid not null references public.discussion_profiles(id),
  operation text not null, target_id uuid not null, reason text not null,
  created_at timestamptz not null default now()
);
create index discussions_latest on public.discussions(status, pinned desc, created_at desc, id);
create index discussions_category on public.discussions(category, status, created_at desc);
create index discussion_replies_thread on public.discussion_replies(discussion_id, status, created_at, id);
create index discussion_replies_author on public.discussion_replies(author_id);
create index discussions_author on public.discussions(author_id);
create index discussion_reactions_post on public.discussion_reactions(discussion_id);
create index discussion_reactions_reply on public.discussion_reactions(reply_id);
create index discussion_reports_status on public.discussion_reports(status, created_at desc);
create index discussion_reports_reply on public.discussion_reports(reply_id);
create index discussion_reports_post on public.discussion_reports(discussion_id);
create index discussion_requests_rate on discussion_private.requests(user_id, created_at desc);

-- Check that the signed-in, non-anonymous account AND the JWT's session still exist.
-- Session lookup closes the deleted-user/revoked-session window of otherwise valid JWTs.
create function discussion_private.member_ok() returns boolean
language sql stable security definer set search_path = '' as $$
 select auth.uid() is not null
 and exists (select 1 from auth.users u where u.id=auth.uid() and not coalesce(u.is_anonymous,false))
 and exists (select 1 from auth.sessions s where s.user_id=auth.uid() and s.id::text = auth.jwt()->>'session_id')
 and not exists(select 1 from discussion_private.identities i where i.user_id=auth.uid() and i.restricted);
$$;
create function discussion_private.admin_ok() returns boolean
language sql stable security definer set search_path = '' as $$
 select discussion_private.member_ok() and exists(select 1 from discussion_private.identities where user_id=auth.uid() and is_admin);
$$;
create function discussion_private.current_profile() returns uuid
language sql stable security definer set search_path = '' as $$
 select profile_id from discussion_private.identities where user_id=auth.uid() and discussion_private.member_ok();
$$;
create function discussion_private.can_read_post(target uuid) returns boolean
language sql stable security definer set search_path = '' as $$
 select discussion_private.member_ok() and exists(select 1 from public.discussions where id=target and (status='visible' or discussion_private.admin_ok()));
$$;
create function discussion_private.can_read_reply(target uuid) returns boolean
language sql stable security definer set search_path = '' as $$
 select discussion_private.member_ok() and exists(select 1 from public.discussion_replies where id=target and (status='visible' or discussion_private.admin_ok()) and discussion_private.can_read_post(discussion_id));
$$;

alter table public.discussion_profiles enable row level security;
alter table public.discussions enable row level security;
alter table public.discussion_replies enable row level security;
alter table public.discussion_reactions enable row level security;
alter table public.discussion_reports enable row level security;
alter table discussion_private.identities enable row level security;
alter table discussion_private.requests enable row level security;
alter table discussion_private.moderation_log enable row level security;
revoke all on public.discussion_profiles, public.discussions, public.discussion_replies, public.discussion_reactions, public.discussion_reports from public, anon, authenticated;
revoke all on all tables in schema discussion_private from public, anon, authenticated;
grant select on public.discussion_profiles, public.discussions, public.discussion_replies, public.discussion_reactions, public.discussion_reports to authenticated;
create policy discussion_profile_read on public.discussion_profiles for select to authenticated using ((select discussion_private.member_ok()));
create policy discussion_post_read on public.discussions for select to authenticated using ((select discussion_private.member_ok()) and (status='visible' or (select discussion_private.admin_ok())));
create policy discussion_reply_read on public.discussion_replies for select to authenticated using ((status='visible' or (select discussion_private.admin_ok())) and discussion_private.can_read_post(discussion_id));
create policy discussion_reaction_read on public.discussion_reactions for select to authenticated using (discussion_private.can_read_post(discussion_id) or discussion_private.can_read_reply(reply_id));
create policy discussion_report_read on public.discussion_reports for select to authenticated using ((select discussion_private.member_ok()) and (reporter_id=(select discussion_private.current_profile()) or (select discussion_private.admin_ok())));
-- There are deliberately no direct INSERT/UPDATE/DELETE grants or policies.
-- All writes use a checked RPC with server-derived identity, limits, and idempotency.

create function discussion_private.ensure_profile() returns uuid
language plpgsql security definer set search_path = '' as $$
declare p uuid; n text; a text;
begin
 if not discussion_private.member_ok() then raise insufficient_privilege using message='Member session required'; end if;
 perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text,0));
 select profile_id into p from discussion_private.identities where user_id=auth.uid();
 if p is null then
  select coalesce(raw_user_meta_data->>'full_name',raw_user_meta_data->>'name','Community member'), raw_user_meta_data->>'avatar_url' into n,a from auth.users where id=auth.uid();
  if char_length(btrim(n)) not between 2 and 60 or n ~ '[@<>[:cntrl:]]' then n:='Community member'; end if;
  if a is not null and a !~ '^https://lh[3-6]\.googleusercontent\.com/[^[:space:]]+$' then a:=null; end if;
  insert into public.discussion_profiles(display_name, avatar_url) values(btrim(n),a) returning id into p;
  insert into discussion_private.identities(user_id,profile_id) values(auth.uid(),p);
 end if;
 return p;
end; $$;
create function discussion_private.profile_json(target uuid) returns jsonb
language sql stable security definer set search_path = '' as $$
 select jsonb_build_object('id',p.id,'display_name',p.display_name,'avatar_url',p.avatar_url,'created_at',p.created_at,'is_admin',coalesce(i.is_admin,false))
 from public.discussion_profiles p left join discussion_private.identities i on i.profile_id=p.id
 where p.id=target and discussion_private.member_ok();
$$;
create function discussion_private.post_json(target public.discussions) returns jsonb
language sql stable security definer set search_path = '' as $$
 select to_jsonb(target) || jsonb_build_object('author',discussion_private.profile_json(target.author_id),
 'reply_count',(select count(*) from public.discussion_replies where discussion_id=target.id and status='visible'),
 'reaction_count',(select count(*) from public.discussion_reactions where discussion_id=target.id),
 'liked',exists(select 1 from public.discussion_reactions where discussion_id=target.id and member_id=discussion_private.current_profile()))
 where discussion_private.can_read_post(target.id);
$$;
create function discussion_private.read_board(options jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare me uuid; lim integer:=least(100,greatest(20,coalesce((options->>'limit')::integer,20))); rlim integer:=least(500,greatest(50,coalesce((options->>'reply_limit')::integer,50)));
 target uuid:=nullif(options->>'id','')::uuid; q text:=left(coalesce(options->>'query',''),150); cat text:=coalesce(options->>'category',''); ord text:=coalesce(options->>'sort','latest');
 ofs integer:=least(1000000,greatest(0,coalesce((options->>'offset')::integer,0))); rofs integer:=least(1000000,greatest(0,coalesce((options->>'reply_offset')::integer,0)));
 posts jsonb:='[]'; replies jsonb:='[]'; reports jsonb:='[]'; thread jsonb; has_more boolean:=false; more_replies boolean:=false;
begin
 me:=discussion_private.ensure_profile();
 if target is not null then
  if not discussion_private.can_read_post(target) then raise no_data_found using message='Discussion unavailable'; end if;
  select discussion_private.post_json(d) into thread from public.discussions d where d.id=target;
  select coalesce(jsonb_agg(row_data order by created_at,id),'[]') into replies from (
   select r.id,r.created_at,to_jsonb(r)||jsonb_build_object('author',discussion_private.profile_json(r.author_id),
   'reaction_count',(select count(*) from public.discussion_reactions where reply_id=r.id),
   'liked',exists(select 1 from public.discussion_reactions where reply_id=r.id and member_id=me)) as row_data
   from public.discussion_replies r where r.discussion_id=target and (r.status='visible' or discussion_private.admin_ok()) order by r.created_at,r.id limit rlim offset rofs
  ) x;
  select count(*)>rlim+rofs into more_replies from public.discussion_replies where discussion_id=target and (status='visible' or discussion_private.admin_ok());
 else
  with matching as (
   select d.*, (select count(*) from public.discussion_reactions where discussion_id=d.id) popularity from public.discussions d
   where (d.status='visible' or discussion_private.admin_ok()) and (cat='' or d.category=cat)
   and (q='' or strpos(lower(d.title||' '||d.content),lower(q))>0) and (ord<>'pinned' or d.pinned)
  ), selected as (
   select id,pinned,created_at,popularity from matching order by pinned desc,case when ord='popular' then popularity else 0 end desc,created_at desc,id limit lim offset ofs
  ) select coalesce(jsonb_agg(discussion_private.post_json(d) order by s.pinned desc,case when ord='popular' then s.popularity else 0 end desc,s.created_at desc,s.id),'[]'),(select count(*)>lim+ofs from matching)
  into posts,has_more from selected s join public.discussions d using(id);
 end if;
 if coalesce((options->>'admin')::boolean,false) then
  if not discussion_private.admin_ok() then raise insufficient_privilege; end if;
  select coalesce(jsonb_agg(to_jsonb(r)||jsonb_build_object('reporter',discussion_private.profile_json(r.reporter_id),
  'thread_id',coalesce(r.discussion_id,(select discussion_id from public.discussion_replies where id=r.reply_id)),
  'reported_content',coalesce((select content from public.discussions where id=r.discussion_id),(select content from public.discussion_replies where id=r.reply_id))) order by r.created_at desc),'[]') into reports
  from (select * from public.discussion_reports where status='open' order by created_at desc limit 100) r;
 end if;
 return jsonb_build_object('me',discussion_private.profile_json(me),'posts',posts,'thread',thread,'replies',replies,'reports',reports,'more',coalesce(has_more,false),'more_replies',more_replies);
end; $$;

create function discussion_private.write_board(action text, payload jsonb, request_id uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare me uuid; administrator boolean; target uuid; parent uuid; p public.discussions; r public.discussion_replies;
 result jsonb; previous discussion_private.requests; signature text:=md5(action||payload::text); op text; txt text; cat text;
begin
 me:=discussion_private.ensure_profile(); administrator:=discussion_private.admin_ok();
 if request_id is null or octet_length(payload::text)>32000 or action not in ('profile','create','edit','delete','reply','edit_reply','delete_reply','react','report','moderate') then raise invalid_parameter_value; end if;
 -- ensure_profile holds a per-user transaction lock, serializing rate checks and duplicate requests.
 select * into previous from discussion_private.requests x where x.user_id=auth.uid() and x.request_id=write_board.request_id;
 if found then
  if previous.fingerprint<>signature then raise invalid_parameter_value using message='Request ID reused'; end if;
  return previous.result;
 end if;
 if (select count(*) from discussion_private.requests where user_id=auth.uid() and created_at>clock_timestamp()-interval '1 minute')>=30
 or (action='create' and (select count(*) from discussion_private.requests x where x.user_id=auth.uid() and x.action='create' and x.created_at>clock_timestamp()-interval '1 hour')>=5)
 or (action='reply' and (select count(*) from discussion_private.requests x where x.user_id=auth.uid() and x.action='reply' and x.created_at>clock_timestamp()-interval '1 hour')>=60)
 then raise exception using errcode='P0003', message='Posting limit reached'; end if;
 target:=nullif(payload->>'id','')::uuid;
 if action='profile' then
  update public.discussion_profiles set display_name=btrim(payload->>'display_name'), updated_at=now() where id=me;
  result:=jsonb_build_object('id',me);
 elsif action='create' then
  cat:=payload->>'category';
  if cat='Binexa Announcements' and not administrator then raise insufficient_privilege; end if;
  insert into public.discussions(author_id,title,content,category) values(me,btrim(payload->>'title'),btrim(payload->>'content'),cat) returning id into target;
  result:=jsonb_build_object('id',target);
 elsif action in ('edit','delete','reply') then
  select * into p from public.discussions where id=target for update;
  if not found or not discussion_private.can_read_post(target) then raise no_data_found; end if;
  if p.locked or p.status<>'visible' then raise insufficient_privilege using message='Thread is locked or hidden'; end if;
  if action='reply' then
   parent:=nullif(payload->>'parent_id','')::uuid;
   if parent is not null and not exists(select 1 from public.discussion_replies where id=parent and discussion_id=target and status='visible') then raise invalid_parameter_value; end if;
   insert into public.discussion_replies(discussion_id,author_id,parent_id,content) values(target,me,parent,btrim(payload->>'content')) returning id into target;
  else
   if p.author_id<>me then raise insufficient_privilege; end if;
   if action='delete' then delete from public.discussions where id=target;
   else
    cat:=payload->>'category';
    if (cat='Binexa Announcements' or p.category='Binexa Announcements') and not administrator then raise insufficient_privilege; end if;
    update public.discussions set title=btrim(payload->>'title'),content=btrim(payload->>'content'),category=cat,updated_at=now() where id=target;
   end if;
  end if;
  result:=jsonb_build_object('id',target);
 elsif action in ('edit_reply','delete_reply') then
  select * into r from public.discussion_replies where id=target for update;
  if not found or not discussion_private.can_read_reply(target) then raise no_data_found; end if;
  select * into p from public.discussions where id=r.discussion_id for update;
  if r.author_id<>me or p.locked or p.status<>'visible' or r.status<>'visible' then raise insufficient_privilege; end if;
  if action='delete_reply' then delete from public.discussion_replies where id=target;
  else update public.discussion_replies set content=btrim(payload->>'content'),updated_at=now() where id=target; end if;
  result:=jsonb_build_object('id',target);
 elsif action in ('react','report') then
  if payload->>'kind'='reply' then
   if not discussion_private.can_read_reply(target) then raise no_data_found; end if;
   select d.* into p from public.discussions d join public.discussion_replies rr on rr.discussion_id=d.id where rr.id=target for update of d;
  elsif payload->>'kind'='discussion' then
   if not discussion_private.can_read_post(target) then raise no_data_found; end if;
   select * into p from public.discussions where id=target for update;
  else raise invalid_parameter_value; end if;
  if action='react' then
   if p.locked or p.status<>'visible' then raise insufficient_privilege; end if;
   if (payload->>'liked')::boolean then
    insert into public.discussion_reactions(member_id,discussion_id,reply_id) values(me,case when payload->>'kind'='discussion' then target end,case when payload->>'kind'='reply' then target end) on conflict do nothing;
   else delete from public.discussion_reactions where member_id=me and (discussion_id=target or reply_id=target); end if;
  else
   insert into public.discussion_reports(reporter_id,discussion_id,reply_id,reason) values(me,case when payload->>'kind'='discussion' then target end,case when payload->>'kind'='reply' then target end,btrim(payload->>'reason')) on conflict do nothing;
  end if;
  result:=jsonb_build_object('id',target);
 elsif action='moderate' then
  if not administrator then raise insufficient_privilege; end if;
  op:=payload->>'operation'; txt:=btrim(payload->>'reason');
  if txt is null or char_length(txt) not between 5 and 1000 or txt ~ '<[^>]*>' then raise invalid_parameter_value; end if;
  if op in ('restrict','unrestrict') then
   if target=me then raise insufficient_privilege; end if;
   update discussion_private.identities set restricted=(op='restrict') where profile_id=target and not is_admin;
  elsif op='resolve_report' then update public.discussion_reports set status='resolved' where id=target;
  elsif payload->>'kind'='reply' and op in ('hide','show','remove') then
   if op='remove' then delete from public.discussion_replies where id=target;
   else update public.discussion_replies set status=case when op='hide' then 'hidden' else 'visible' end,updated_at=now() where id=target; end if;
  elsif coalesce(payload->>'kind','discussion')='discussion' then
   if op='remove' then delete from public.discussions where id=target;
   elsif op in ('pin','unpin') then update public.discussions set pinned=(op='pin'),updated_at=now() where id=target;
   elsif op in ('lock','unlock') then update public.discussions set locked=(op='lock'),updated_at=now() where id=target;
   elsif op in ('hide','show') then update public.discussions set status=case when op='hide' then 'hidden' else 'visible' end,updated_at=now() where id=target;
   else raise invalid_parameter_value; end if;
  else raise invalid_parameter_value; end if;
  if not found then raise no_data_found; end if;
  insert into discussion_private.moderation_log(actor_id,operation,target_id,reason) values(me,op,target,txt);
  result:=jsonb_build_object('id',target);
 end if;
 insert into discussion_private.requests(user_id,request_id,action,fingerprint,result) values(auth.uid(),request_id,action,signature,result);
 return result;
end; $$;
-- Definer implementations live in a non-exposed schema; exposed wrappers are invokers.
create function public.discussion_read(options jsonb default '{}') returns jsonb
language sql security invoker set search_path='' as $$ select discussion_private.read_board(options); $$;
create function public.discussion_write(action text,payload jsonb,request_id uuid) returns jsonb
language sql security invoker set search_path='' as $$ select discussion_private.write_board(action,payload,request_id); $$;

-- Private, payload-free invalidations. Actual content is fetched through authenticated API/RPC.
create function discussion_private.notify_change() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 perform realtime.send('{}'::jsonb,'changed','binexa:discussions',true);
 return null;
end; $$;
create trigger discussion_change after insert or update or delete on public.discussions for each statement execute function discussion_private.notify_change();
create trigger discussion_reply_change after insert or update or delete on public.discussion_replies for each statement execute function discussion_private.notify_change();
create trigger discussion_reaction_change after insert or delete on public.discussion_reactions for each statement execute function discussion_private.notify_change();
create trigger discussion_profile_change after update on public.discussion_profiles for each statement execute function discussion_private.notify_change();
create trigger discussion_member_change after update on discussion_private.identities for each statement execute function discussion_private.notify_change();
create trigger discussion_report_change after insert or update or delete on public.discussion_reports for each statement execute function discussion_private.notify_change();
alter table realtime.messages enable row level security;
grant select on realtime.messages to authenticated;
create policy binexa_discussion_broadcast_read on realtime.messages for select to authenticated
 using (realtime.topic()='binexa:discussions' and (select discussion_private.member_ok()));
-- No client broadcast INSERT policy. No discussion tables added to public Postgres Changes.
revoke all on all functions in schema discussion_private from public, anon, authenticated;
grant execute on function discussion_private.member_ok(), discussion_private.admin_ok(), discussion_private.current_profile(), discussion_private.can_read_post(uuid), discussion_private.can_read_reply(uuid), discussion_private.read_board(jsonb), discussion_private.write_board(text,jsonb,uuid) to authenticated;
revoke all on function public.discussion_read(jsonb), public.discussion_write(text,jsonb,uuid) from public, anon;
grant execute on function public.discussion_read(jsonb), public.discussion_write(text,jsonb,uuid) to authenticated;
notify pgrst, 'reload schema';
commit;
