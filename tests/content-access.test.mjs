import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { isMemberPath } from '../lib/auth/navigation.ts';
import { readdirSync } from 'node:fs';
test('published content and information routes are public; accounts remain protected', () => {
  for (const path of ['/', '/community', '/about', '/privacy', '/data-deletion', '/resources', '/resources/', '/resources/glp1-questions', '/resources/healthy-habits-that-stick', '/resources/unknown', '/explore', '/offerings', '/join', '/events', '/habits', '/lounge', '/start']) assert.equal(isMemberPath(path), false, path);
  for (const path of ['/member', '/member/', '/member/settings', '/discussions', '/discussions/', '/discussions/topic', '/%64iscussions']) assert.equal(isMemberPath(path), true, path);
});
test('published page tree has no gates except Discussions', () => {
  for (const file of readdirSync('app/(community-site)', { recursive: true }).filter(file => /\.tsx$/.test(file))) {
    if (file.startsWith('discussions/')) continue;
    assert.doesNotMatch(readFileSync(`app/(community-site)/${file}`, 'utf8'), /requireAccount|requireDiscord|isPublicArticle/);
  }
  assert.match(readFileSync('app/member/page.tsx', 'utf8'), /await requireAccount/);
});
test('public content has no account-link gates or blocked embedded resources', () => {
  for (const file of ['components/Header.tsx', 'components/CommunityHome.tsx']) {
    assert.doesNotMatch(readFileSync(file, 'utf8'), /Create My Free Account|href="\/sign-(in|up)"/);
  }
  assert.doesNotMatch(readFileSync('components/auth/AuthProvider.tsx', 'utf8'), /continue reading|community-signup-preview/);
  assert.doesNotMatch(readFileSync('components/auth-popup.css', 'utf8'), /community-signup-preview/);
});
test('sign-in returns to the safe requested route and sign-out discards router cache', () => {
  const callback = readFileSync('app/auth/callback/route.ts', 'utf8');
  assert.match(callback, /const next = safeNextPath/);
  assert.match(callback, /const destination = new URL\(next, origin\)/);
  assert.match(readFileSync('app/member/sign-out-button.tsx', 'utf8'), /window.location.replace\("\/"\)/);
  assert.match(readFileSync('app/auth/sign-in/route.ts', 'utf8'), /if \(provider !== "google"\)/);
});

test('server account check accepts a verified member and rejects missing or invalid sessions', async () => {
  const { stripTypeScriptTypes } = await import('node:module');
  const source = readFileSync('lib/auth/require-account.ts', 'utf8').replace(/^import .*;\n/gm, '').replace('export const requireAccount', 'const requireAccount');
  const load = (user, error, configured = true) => new Function('cache', 'redirect', 'createClient', 'isSupabaseConfigured', stripTypeScriptTypes(source) + '\nreturn requireAccount;')(
    fn => fn,
    destination => { throw new Error(destination); },
    async () => ({ auth: { getUser: async () => ({ data: { user }, error }) } }),
    () => configured,
  );
  const member = { id: 'verified-test-member' };
  assert.equal(await load(member, null)('/resources/glp1-questions'), member);
  for (const guard of [load(null, null), load(member, Error('expired')), load(null, null, false)]) {
    await assert.rejects(guard('/resources/glp1-questions'), /auth=sign-in&next=%2Fresources%2Fglp1-questions/);
  }
});

test('OAuth callback exchanges the code and returns members directly to their requested content', async () => {
  const { stripTypeScriptTypes } = await import('node:module');
  const source = readFileSync('app/auth/callback/route.ts', 'utf8').replace(/^import .*;\n/gm, '').replace('export async function GET', 'async function GET');
  let exchanged = '';
  const { safeNextPath } = await import('../lib/auth/navigation.ts');
  const handler = new Function('NextResponse', 'createClient', 'isSupabaseConfigured', 'getAuthOrigin', 'safeNextPath', stripTypeScriptTypes(source) + '\nreturn GET;')(
    { redirect: destination => ({ location: String(destination) }), json: value => value },
    async () => ({ auth: { exchangeCodeForSession: async code => { exchanged = code; return { error: null }; } } }),
    () => true, () => 'http://localhost:3000', safeNextPath,
  );
  const url = new URL('http://localhost:3000/auth/callback?code=test-code&next=%2Fresources%2Fglp1-questions');
  assert.equal((await handler({ url: url.href, nextUrl: url })).location, 'http://localhost:3000/resources/glp1-questions');
  assert.equal(exchanged, 'test-code');
});
