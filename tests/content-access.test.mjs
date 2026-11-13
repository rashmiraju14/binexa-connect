import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { isPublicArticle, isMemberPath, publicArticleSlugs } from '../lib/auth/navigation.ts';
test('only the three selected article slugs are public, regardless of previous reading', () => {
  assert.equal(publicArticleSlugs.length, 3);
  for (const slug of publicArticleSlugs) {
    assert.equal(isPublicArticle(slug), true);
    assert.equal(isMemberPath(`/resources/${slug}`), false);
    assert.equal(isMemberPath(`/resources/${slug}/`), false);
  }
  for (const slug of ['welcome-to-binexa-connect', 'glp1-questions', 'ai-and-healthcare', 'unknown', 'Healthy-habits-that-stick']) {
    assert.equal(isPublicArticle(slug), false);
    assert.equal(isMemberPath(`/resources/${slug}`), true);
  }
  assert.equal(isMemberPath('/resources/healthy%2Dhabits-that-stick'), false);
  assert.equal(isMemberPath('/resources/%ZZ'), true);
});
test('previews, public landings, auth and safety remain public; community routes remain protected', () => {
  for (const path of ['/', '/community', '/about', '/privacy', '/data-deletion', '/sign-in', '/sign-up']) assert.equal(isMemberPath(path), false, path);
  for (const path of ['/resources', '/resources/', '/member', '/explore', '/offerings', '/join', '/events', '/discussions', '/habits', '/lounge', '/start']) assert.equal(isMemberPath(path), true, path);
});
test('article data remains server-only and page and layout both check access', () => {
  const body = readFileSync('lib/articles.ts', 'utf8');
  assert.match(body, /import "server-only"/);
  const page = readFileSync('app/(community-site)/resources/[slug]/page.tsx', 'utf8');
  const guard = page.indexOf('if (!isPublicArticle(slug)) await requireAccount');
  assert.ok(guard >= 0 && guard < page.indexOf('const article ='));
  assert.match(readFileSync('app/(community-site)/resources/[slug]/layout.tsx', 'utf8'), /if \(!isPublicArticle\(slug\)\) await requireAccount/);
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
