// Isolated PostgreSQL verification, never a hosted project. See DISCUSSIONS_SETUP.md.
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { pathToFileURL } from 'node:url';
const modulePath = process.env.PGLITE_MODULE;
if (!modulePath) throw Error('Set PGLITE_MODULE to an isolated @electric-sql/pglite/dist/index.js installation.');
const { PGlite } = await import(pathToFileURL(modulePath));
const directory = mkdtempSync(join(tmpdir(), 'binexa-discussion-db-'));
let db = new PGlite(directory);
const a = randomUUID(), b = randomUUID(), admin = randomUUID();
const sa = randomUUID(), sb = randomUUID(), sc = randomUUID();
await db.exec(`
 create role anon; create role authenticated; create role service_role;
 create schema auth; create schema realtime;
 create table auth.users(id uuid primary key, is_anonymous boolean default false, raw_user_meta_data jsonb default '{}');
 create table auth.sessions(id uuid primary key, user_id uuid references auth.users(id));
 create function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb $$;
 create function auth.uid() returns uuid language sql stable as $$ select (auth.jwt()->>'sub')::uuid $$;
 grant usage on schema auth to authenticated,anon;
 grant execute on function auth.jwt(),auth.uid() to authenticated,anon;
 create table realtime.messages(id bigint generated always as identity, topic text, payload jsonb);
 alter table realtime.messages enable row level security;
 grant usage on schema realtime to authenticated,anon;
 grant select on realtime.messages to authenticated,anon;
 create function realtime.topic() returns text language sql stable as $$ select current_setting('realtime.topic',true) $$;
 create function realtime.send(payload jsonb,event text,topic text,private boolean) returns void language sql as $$ insert into realtime.messages(topic,payload) values(topic,payload) $$;
 insert into auth.users(id,raw_user_meta_data) values ('${a}','{"full_name":"Member A","is_admin":true,"email":"private@example.com"}'),('${b}','{"full_name":"Member B"}'),('${admin}','{"full_name":"Moderator"}');
 insert into auth.sessions values('${sa}','${a}'),('${sb}','${b}'),('${sc}','${admin}');
`);
await db.exec(readFileSync('supabase/migrations/20261121171423_live_member_discussions.sql','utf8'));
async function as(user, session, sql, values=[]) {
  await db.exec('reset role');
  await db.query("select set_config('request.jwt.claims',$1,false)",[JSON.stringify(user ? { sub:user, session_id:session } : {})]);
  await db.exec(user ? 'set role authenticated' : 'set role anon');
  return db.query(sql,values);
}
async function read(user=a,session=sa, options={}) { return (await as(user,session,'select public.discussion_read($1::jsonb) as data',[JSON.stringify(options)])).rows[0].data; }
async function write(user,session,action,payload,id=randomUUID()) { return (await as(user,session,'select public.discussion_write($1,$2::jsonb,$3::uuid) as data',[action,JSON.stringify(payload),id])).rows[0].data; }
async function denied(fn, code='42501') { await assert.rejects(fn,e=>e.code===code); }
try {
 const first=await read(); const second=await read(b,sb); await read(admin,sc);
 assert.equal(first.posts.length,0); assert.equal(first.me.is_admin,false,'editable auth metadata never grants admin');
 assert.ok(!JSON.stringify(first).includes(a)); assert.ok(!JSON.stringify(first).includes('private@example.com'));
 await denied(()=>as(null,null,'select * from public.discussions'));
 await denied(()=>as(null,null,"select public.discussion_read('{}')"));
 await denied(()=>read(a,randomUUID()));
 const key=randomUUID(); const payload={title:'An educational discussion',content:'What helps you build a regular walking routine?',category:'Longevity & Wellness',author_id:second.me.id,pinned:true,is_admin:true};
 const post=await write(a,sa,'create',payload,key);
 assert.equal((await write(a,sa,'create',payload,key)).id,post.id,'request retry is idempotent');
 await denied(()=>write(a,sa,'create',{...payload,title:'Different payload'},key),'22023');
 let board=await read(b,sb);
 assert.equal(board.posts[0].author_id,first.me.id,'browser cannot impersonate another member');
 assert.equal(board.posts[0].pinned,false);
 await denied(()=>write(b,sb,'edit',{...payload,id:post.id}));
 await denied(()=>write(b,sb,'delete',{id:post.id}));
 await denied(()=>write(b,sb,'moderate',{id:post.id,operation:'pin',reason:'Try unauthorized privileges'}));
 await denied(()=>write(b,sb,'create',{...payload,category:'Binexa Announcements'}));
 await denied(()=>as(b,sb,'update public.discussions set pinned=true where id=$1',[post.id]));
 await denied(()=>as(b,sb,'select * from discussion_private.identities'));
 await denied(()=>as(b,sb,"select discussion_private.ensure_profile()"));
 const reply=await write(b,sb,'reply',{id:post.id,content:'Scheduling a short walk helps me.'});
 const nested=await write(a,sa,'reply',{id:post.id,parent_id:reply.id,content:'Thanks for sharing your experience.'});
 await write(b,sb,'edit_reply',{id:reply.id,content:'A short walk after lunch works for me.'});
 await denied(()=>write(a,sa,'edit_reply',{id:reply.id,content:'Impersonation'}));
 await denied(()=>write(a,sa,'delete_reply',{id:reply.id}));
 await write(a,sa,'react',{id:post.id,kind:'discussion',liked:true});
 await write(a,sa,'react',{id:post.id,kind:'discussion',liked:true});
 await write(b,sb,'react',{id:post.id,kind:'discussion',liked:true});
 await write(a,sa,'react',{id:reply.id,kind:'reply',liked:true});
 board=await read(a,sa,{id:post.id}); assert.equal(board.thread.reaction_count,2);assert.equal(board.thread.reply_count,2);assert.equal(board.replies[0].reaction_count,1);
 await write(a,sa,'react',{id:post.id,kind:'discussion',liked:false});
 assert.equal((await read(b,sb)).posts[0].reaction_count,1);
 await write(a,sa,'report',{id:reply.id,kind:'reply',reason:'Please review this reply for context.'});
 assert.equal((await as(b,sb,'select * from public.discussion_reports')).rows.length,0,'reports are private');
 assert.equal((await as(a,sa,'select * from public.discussion_reports')).rows.length,1);
 await denied(()=>read(b,sb,{admin:true}));
 await denied(()=>write(b,sb,'create',{...payload,content:'<script>alert(1)</script>'}),'23514');
 await denied(()=>write(b,sb,'create',{...payload,content:'x'.repeat(10001)}),'23514');
 await denied(()=>write(b,sb,'profile',{display_name:'private@example.com'}),'23514');
 await write(a,sa,'profile',{display_name:'Walking Enthusiast'});
 await db.exec('reset role');
 await db.query('update discussion_private.identities set is_admin=true where user_id=$1',[admin]);
 await write(admin,sc,'moderate',{id:post.id,operation:'pin',reason:'Useful community discussion'});
 await write(admin,sc,'moderate',{id:post.id,operation:'lock',reason:'Pause new contributions for review'});
 await denied(()=>write(b,sb,'reply',{id:post.id,content:'Thread is locked'}));
 await write(admin,sc,'moderate',{id:post.id,operation:'unlock',reason:'Review complete; reopen thread'});
 await write(admin,sc,'moderate',{id:reply.id,kind:'reply',operation:'hide',reason:'Review reply visibility'});
 assert.equal((await read(a,sa,{id:post.id})).replies.length,1);
 await write(admin,sc,'moderate',{id:reply.id,kind:'reply',operation:'show',reason:'Restore reviewed reply'});
 await write(admin,sc,'moderate',{id:post.id,operation:'hide',reason:'Temporarily hide discussion'});
 assert.equal((await read(b,sb)).posts.length,0);
 await denied(()=>read(b,sb,{id:post.id}),'P0002');
 await write(admin,sc,'moderate',{id:post.id,operation:'show',reason:'Restore reviewed discussion'});
 await write(admin,sc,'moderate',{id:second.me.id,operation:'restrict',reason:'Restrict posting after review'});
 await denied(()=>read(b,sb));
 await denied(()=>write(b,sb,'reply',{id:post.id,content:'Restricted member'}));
 await write(admin,sc,'moderate',{id:second.me.id,operation:'unrestrict',reason:'Restore member after review'});
 const reports=(await read(admin,sc,{admin:true})).reports; assert.equal(reports.length,1);
 await write(admin,sc,'moderate',{id:reports[0].id,operation:'resolve_report',reason:'Reviewed report and resolved issue'});
 assert.equal((await read(admin,sc,{admin:true})).reports.length,0);
 await db.exec('reset role');
 assert.ok((await db.query('select count(*)::integer as n from discussion_private.moderation_log')).rows[0].n>=8);
 assert.ok((await db.query("select count(*)::integer as n from realtime.messages where payload <> '{}'::jsonb")).rows[0].n===0,'broadcast carries no content or identities');
 await as(a,sa,"select set_config('realtime.topic','binexa:discussions',false)");
 assert.ok((await as(a,sa,'select * from realtime.messages')).rows.length>0);
 assert.equal((await as(null,null,'select * from realtime.messages')).rows.length,0);
 // Close and reopen PostgreSQL; two separate member JWTs see persisted contributions.
 await db.close(); db=new PGlite(directory);
 assert.equal((await read(a,sa,{id:post.id})).thread.title,payload.title);
 assert.equal((await read(b,sb,{id:post.id})).replies.length,2);
 await write(b,sb,'delete_reply',{id:reply.id});
 const remainingReplies=(await read(a,sa,{id:post.id})).replies;
 assert.equal(remainingReplies.length,1,'deleting a parent reply preserves another member’s reply');
 assert.equal(remainingReplies[0].parent_id,null);
 await write(a,sa,'delete_reply',{id:nested.id});
 assert.equal((await read()).posts[0].reply_count,0);
 // Revoking the auth session removes both RLS reads and RPC access immediately.
 await db.exec('reset role');await db.query('delete from auth.sessions where id=$1',[sb]);
 await denied(()=>read(b,sb));assert.equal((await as(b,sb,'select * from public.discussions')).rows.length,0);
 // Five discussions per member/hour, enforced even through direct RPC calls.
 for(let i=0;i<4;i++)await write(a,sa,'create',{...payload,title:`Another discussion ${i}`});
 await denied(()=>write(a,sa,'create',{...payload,title:'Posting limit exceeded'}),'P0003');
 await write(a,sa,'delete',{id:post.id});
 console.log('PASS: migration, two member identities, persistence after database restart, anonymous denial, session revocation, ownership, impersonation, reactions, reports, moderation, private notifications, validation, idempotency, and posting limits.');
} finally { await db.close(); }
