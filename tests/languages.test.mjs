import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
const source = readFileSync('lib/languages.ts', 'utf8');
const exports = {};
new Function('exports', ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText)(exports);
test('supported languages and translation batch boundaries', () => {
  assert.deepEqual(exports.languages.map(item => item.code), ['en', 'zh-CN', 'vi', 'es']);
  assert.ok(exports.validTranslation({ target: 'vi', texts: ['New Releases', 'A member conversation'] }));
  for (const value of [null, {}, { target: 'fr', texts: ['hello'] }, { target: 'es', texts: [] }, { target: 'es', texts: [23] }, { target: 'vi', texts: ['x'.repeat(5001)] }, { target: 'es', texts: Array(81).fill('hello') }, { target: 'zh-CN', texts: Array(3).fill('x'.repeat(5000)) }]) assert.equal(exports.validTranslation(value), false);
});

function loadRoute() {
  const output = ts.transpileModule(readFileSync('app/api/translate/route.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const route = {};
  new Function('require', 'exports', output)(name => {
    if (name === '@/lib/languages') return exports;
    if (name === 'next/server') return { NextResponse: { json: (body, options) => ({ body, ...options }) } };
    throw Error(name);
  }, route);
  return route;
}
function request(body, origin = 'http://localhost:3100') {
  const req = new Request('http://localhost:3100/api/translate', { method: 'POST', headers: { origin, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  req.nextUrl = new URL(req.url);
  return req;
}
test('translation route protects the key, rejects invalid requests and preserves provider failures', async () => {
  const savedKey = process.env.LIBRETRANSLATE_API_KEY;
  const savedUrl = process.env.LIBRETRANSLATE_URL;
  const savedFetch = globalThis.fetch;
  try {
    delete process.env.LIBRETRANSLATE_URL;
    delete process.env.LIBRETRANSLATE_API_KEY;
    const route = loadRoute();
    assert.equal((await route.POST(request({ target: 'es', texts: ['hello'] }))).status, 503);
    assert.equal((await route.POST(request({}, 'https://untrusted.example'))).status, 403);
    process.env.LIBRETRANSLATE_URL = 'http://127.0.0.1:5100';
    assert.equal((await route.POST(request({ target: 'fr', texts: ['hello'] }))).status, 400);
    globalThis.fetch = async (url, options) => {
      assert.equal(String(url), 'http://127.0.0.1:5100/translate');
      assert.equal(JSON.parse(options.body).source, 'auto');
      assert.ok(!('api_key' in JSON.parse(options.body))); 
      assert.equal(JSON.parse(options.body).target, 'vi');
      return { ok: true, json: async () => ({ translatedText: ['Xin chào'] }) };
    };
    const result = await route.POST(request({ target: 'vi', texts: ['Hello'] }));
    assert.deepEqual(result.body, { translations: ['Xin chào'] });
    assert.equal(result.headers['Cache-Control'], 'private, no-store');
    process.env.LIBRETRANSLATE_API_KEY = 'private-self-hosted-key';
    globalThis.fetch = async (url, options) => {
      const payload = JSON.parse(options.body);
      assert.equal(payload.target, 'zh-Hans');
      assert.equal(payload.api_key, 'private-self-hosted-key');
      return { ok: true, json: async () => ({ translatedText: ['你好'] }) };
    };
    assert.deepEqual((await route.POST(request({ target: 'zh-CN', texts: ['Hello'] }))).body, { translations: ['你好'] });
    globalThis.fetch = async () => ({ ok: true, json: async () => ({ translatedText: [] }) });
    assert.equal((await route.POST(request({ target: 'es', texts: ['hello'] }))).status, 502);
    globalThis.fetch = async () => ({ ok: false, status: 429 });
    assert.equal((await route.POST(request({ target: 'es', texts: ['hello'] }))).status, 429);
    globalThis.fetch = async () => ({ ok: false });
    assert.equal((await route.POST(request({ target: 'es', texts: ['hello'] }))).status, 502);
  } finally {
    globalThis.fetch = savedFetch;
    if (savedUrl === undefined) delete process.env.LIBRETRANSLATE_URL; else process.env.LIBRETRANSLATE_URL = savedUrl;
    if (savedKey === undefined) delete process.env.LIBRETRANSLATE_API_KEY; else process.env.LIBRETRANSLATE_API_KEY = savedKey;
  }
});

test('Cloudflare keeps credentials private, preserves order and handles quota errors', async () => {
  const oldFetch = globalThis.fetch;
  try {
    process.env.CLOUDFLARE_ACCOUNT_ID = 'a'.repeat(32);
    process.env.CLOUDFLARE_API_TOKEN = 'test-private-token';
    const route = loadRoute();
    globalThis.fetch = async (url, options) => {
      assert.equal(String(url), `https://api.cloudflare.com/client/v4/accounts/${'a'.repeat(32)}/ai/run/@cf/meta/m2m100-1.2b`);
      assert.equal(options.headers.Authorization, 'Bearer test-private-token');
      const p = JSON.parse(options.body);
      return { ok: true, json: async () => ({ success: true, result: { translated_text: `${p.target_lang}:${p.text}` } }) };
    };
    for (const [target, code] of [['zh-CN','zh'],['vi','vi'],['es','es']]) {
      const result = await route.POST(request({ target, texts: ['Hello', 'Welcome'] }));
      assert.deepEqual(result.body, { translations: [`${code}:Hello`, `${code}:Welcome`] });
      assert.ok(!JSON.stringify(result).includes('test-private-token'));
    }
    globalThis.fetch = async () => ({ ok: false, status: 429 });
    assert.equal((await route.POST(request({ target: 'es', texts: ['Hello'] }))).status, 429);
    globalThis.fetch = async () => ({ ok: true, json: async () => ({ success: true, result: {} }) });
    assert.equal((await route.POST(request({ target: 'es', texts: ['Hello'] }))).status, 502);
  } finally {
    globalThis.fetch = oldFetch;
    delete process.env.CLOUDFLARE_ACCOUNT_ID;
    delete process.env.CLOUDFLARE_API_TOKEN;
  }
});


test('member discussion routes are excluded from external translation', () => {
  const selector = readFileSync('components/language/LanguageSelector.tsx', 'utf8');
  assert.ok(selector.includes("pathname === '/discussions' || pathname.startsWith('/discussions/')"));
});
