import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';
const require = createRequire(import.meta.url);
const { NextRequest } = require('next/server');
function load(file,mocks={}) { const exports={}; new Function('require','exports',ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(name=>name in mocks ? mocks[name] : require(name),exports);return exports; }
const shared=load('lib/discussions/shared.ts');
const requestId='12345678-1234-4234-8234-123456789012';
function fixture({user={id:'verified-user'},authError=null,result={posts:[]},dbError=null}={}) {
 const calls=[];const client={auth:{getUser:async()=>({data:{user},error:authError})},rpc:async(name,args)=>{calls.push({name,args});return {data:result,error:dbError};}};
 const api=load('app/api/discussions/route.ts',{'@/lib/supabase/server':{createClient:async()=>client},'@/lib/discussions/shared':shared});return {api,calls};
}
function post(value,headers={}) { return new NextRequest('https://binexaconnect.com/api/discussions',{method:'POST',headers:{origin:'https://binexaconnect.com','content-type':'application/json',...headers},body:typeof value==='string'?value:JSON.stringify(value)}); }
test('discussion API rejects signed-out and anonymous-auth sessions without touching the database',async()=>{
 for(const user of [null,{id:'anonymous',is_anonymous:true}]) {
  const {api,calls}=fixture({user});assert.equal((await api.GET(new NextRequest('https://binexaconnect.com/api/discussions'))).status,401);
  assert.equal((await api.POST(post({action:'create',requestId,payload:{}}))).status,401);assert.equal(calls.length,0);
 }
});
test('authenticated reads are uncached, validate thread IDs, and bound search and pagination',async()=>{
 const {api,calls}=fixture();const bad=await api.GET(new NextRequest('https://binexaconnect.com/api/discussions?id=bad-id'));assert.equal(bad.status,400);assert.equal(calls.length,0);
 const response=await api.GET(new NextRequest('https://binexaconnect.com/api/discussions?limit=9999&query='+('a'.repeat(300))));
 assert.equal(response.status,200);assert.match(response.headers.get('cache-control'),/no-store/);assert.equal(response.headers.get('vary'),'Cookie');
 assert.equal(calls[0].name,'discussion_read');assert.equal(calls[0].args.options.limit,100);assert.equal(calls[0].args.options.query.length,150);
});
test('writes reject cross-origin, malformed, oversized, and invalid-action submissions',async()=>{
 const {api,calls}=fixture();
 assert.equal((await api.POST(post({}, {origin:'https://other.example'}))).status,403);
 assert.equal((await api.POST(post('{}', {'content-type':'text/plain'}))).status,415);
 assert.equal((await api.POST(post('malformed json'))).status,400);
 assert.equal((await api.POST(post({action:'grant_admin',requestId,payload:{}}))).status,400);
 assert.equal((await api.POST(post({action:'reply',requestId:'invalid',payload:{}}))).status,400);
 assert.equal((await api.POST(post({action:'reply',requestId,payload:{content:'x'.repeat(33000)}}))).status,413);
 assert.equal(calls.length,0);
});
test('database confirmation precedes success, errors are safe, and setup failures are explicit',async()=>{
 const {api,calls}=fixture({result:{id:requestId}});
 const response=await api.POST(post({action:'create',requestId,payload:{title:'A real message'}}));assert.equal(response.status,200);assert.deepEqual(await response.json(),{result:{id:requestId}});
 assert.equal(calls[0].args.request_id,requestId);assert.equal(calls[0].args.action,'create');
 for(const [code,status] of [['PGRST202',503],['42501',403],['P0002',404],['P0003',429],['23514',400],['XX000',500]]){
  const f=fixture({dbError:{code,message:'Private diagnostic that must never appear'}});const r=await f.api.GET(new NextRequest('https://binexaconnect.com/api/discussions'));assert.equal(r.status,status);assert.ok(!(await r.text()).includes('Private diagnostic'));
 }
});
test('member profile identities and validation never use email as a display identity',()=>{
 assert.equal(shared.categories.length,9);assert.equal(shared.initials('Member Example'),'ME');assert.equal(shared.validMutation({action:'profile',requestId,payload:{}}),true);
 const client=readFileSync('lib/discussions/use-board.ts','utf8');assert.ok(client.includes('private: true'));assert.ok(client.includes('removeChannel'));assert.ok(client.includes('15_000'));assert.ok(!client.includes('localStorage'));
 const board=readFileSync('components/DiscussionBoard.tsx','utf8');assert.ok(!board.includes('Design preview'));assert.ok(!board.includes('Send preview'));
});
