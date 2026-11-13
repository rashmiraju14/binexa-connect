import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';
const require = createRequire(import.meta.url);
const compiled = ts.transpileModule(readFileSync('app/member/sign-out-button.tsx', 'utf8'), {
  compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;

async function runSignOut(error) {
  const calls = [];
  const priorWindow = globalThis.window;
  globalThis.window = { location: { replace: path => calls.push(['redirect', path]) }, addEventListener() {}, removeEventListener() {} };
  try {
    const exports = {};
    new Function('require', 'exports', compiled)(name => {
      if (name === 'react') return { useState: value => [value, next => calls.push(['state', next])], useEffect: effect => effect() };
      if (name.endsWith('/config')) return { isSupabaseConfigured: () => false };
      if (name.endsWith('/client')) return { createClient: () => ({ auth: { signOut: async () => { calls.push(['signOut']); return { error }; } } }) };
      if (name.endsWith('/navigation')) return { isMemberPath: () => true };
      return require(name);
    }, exports);
    const element = exports.default();
    const button = element.props.children.find(child => child?.type === 'button');
    await button.props.onClick();
    return calls;
  } finally { globalThis.window = priorWindow; }
}
test('successful sign-out uses Supabase and navigates to a fresh public document', async () => {
  const calls = await runSignOut(null);
  assert.ok(calls.some(call => call[0] === 'signOut'));
  assert.ok(calls.some(call => call[0] === 'redirect' && call[1] === '/'));
});
test('failed sign-out surfaces the error without claiming the session was cleared', async () => {
  const calls = await runSignOut(Error('Sign out unavailable'));
  assert.equal(calls.some(call => call[0] === 'redirect'), false);
  assert.ok(calls.some(call => call[0] === 'state' && call[1] === 'Sign out unavailable'));
});
