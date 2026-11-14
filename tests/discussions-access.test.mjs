import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';
import { isDiscussionPath, isProtectedContentPath, safeNextPath } from '../lib/auth/navigation.ts';
const require = createRequire(import.meta.url);
function load(file, mocks) {
  const compiled = ts.transpileModule(readFileSync(file, 'utf8'), {
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const exports = {};
  new Function('require', 'exports', compiled)(name => name in mocks ? mocks[name] : require(name), exports);
  return exports;
}
function provider(authenticated = false, destination = '/', pathname = '/') {
  const calls = [];
  let stateIndex = 0;
  const initial = [null, destination, '', false, authenticated, null, ''];
  const effects = [];
  const mocks = {
    react: {
      createContext: () => ({ Provider: 'provider' }), useContext: () => ({}),
      useRef: () => ({ current: null }), useEffect: effect => effects.push(effect),
      useState: () => { const index = stateIndex++; return [initial[index], value => calls.push(['state', index, value])]; },
    },
    'next/navigation': { usePathname: () => pathname, useSearchParams: () => new URLSearchParams(), useRouter: () => ({ replace: path => calls.push(['replace', path]), refresh: () => calls.push(['refresh']) }) },
    '@/lib/supabase/client': { createClient: () => { throw Error('No real auth calls in component test'); } },
    '@/lib/supabase/config': { isSupabaseConfigured: () => false },
    '@/components/AuthPopup': { default: 'auth-popup' },
    '@/lib/auth/navigation': { isDiscussionPath, isProtectedContentPath, safeNextPath },
    'next/image': { default: 'image' },
  };
  const element = load('components/auth/AuthProvider.tsx', mocks).AuthProvider({ authenticated, children: 'content' });
  return { calls, effects, wrapper: element.props.children[0], popup: element.props.children[1] };
}
function click(component, href, options = {}) {
  const previousElement = globalThis.Element;
  const previousWindow = globalThis.window;
  let prevented = false;
  const anchor = { href: new URL(href, 'http://localhost:3000').href, hasAttribute: () => false };
  globalThis.Element = class { closest() { return anchor; } };
  globalThis.window = { location: { origin: 'http://localhost:3000' } };
  try {
    component.wrapper.props.onClickCapture({ target: new globalThis.Element(), button: 0, preventDefault: () => { prevented = true; }, ...options });
    return prevented;
  } finally { globalThis.Element = previousElement; globalThis.window = previousWindow; }
}
test('only signed-out Discussion clicks are intercepted in Sign In mode and preserve the destination', () => {
  const component = provider();
  assert.equal(click(component, '/discussions?channel=wellness#latest'), true);
  assert.ok(component.calls.some(call => call[0] === 'state' && call[1] === 0 && call[2] === 'signin'));
  assert.ok(component.calls.some(call => call[0] === 'state' && call[1] === 1 && call[2] === '/discussions?channel=wellness#latest'));
  assert.equal(component.calls.some(call => call[0] === 'replace'), false);
  for (const path of ['/', '/resources', '/resources/glp1-questions', '/offerings', '/about', '/lounge', 'https://example.com/discussions', '/discussions-other']) {
    assert.equal(click(provider(), path), false, path);
  }
  assert.equal(click(provider(true), '/discussions'), false);
  assert.equal(click(provider(), '/discussions', { ctrlKey: true }), false);
});
test('closing the existing popup keeps the current page; success closes and returns to Discussions', () => {
  const previousWindow = globalThis.window;
  const navigations = [];
  globalThis.window = { location: { href: 'http://localhost:3000/resources?topic=wellness', assign: path => navigations.push(path) }, history: { replaceState: () => {} } };
  try {
    const closed = provider(false, '/discussions');
    closed.popup.props.onClose();
    assert.ok(closed.calls.some(call => call[0] === 'state' && call[1] === 0 && call[2] === null));
    assert.equal(closed.calls.some(call => call[0] === 'replace'), false);
    const success = provider(false, '/discussions');
    assert.equal(success.popup.props.nextPath, '/discussions');
    success.popup.props.onSuccess();
    assert.ok(success.calls.some(call => call[0] === 'state' && call[1] === 0 && call[2] === null));
    assert.deepEqual(navigations, ['/discussions']);
  } finally { globalThis.window = previousWindow; }
});
test('discussion page and layout reject unsigned visitors and permit authenticated members', async () => {
  for (const file of ['app/(community-site)/discussions/page.tsx', 'app/(community-site)/discussions/layout.tsx']) {
    for (const signedIn of [false, true]) {
      let checked = false;
      const page = load(file, {
        '@/lib/auth/require-account': { requireAccount: async destination => { checked = true; assert.equal(destination, '/discussions'); if (!signedIn) throw Error('Sign in required'); } },
        '@/components/DiscussionBoard': { default: 'discussion-board' },
      }).default;
      if (signedIn) assert.ok(await page({ children: 'member content' }));
      else await assert.rejects(page({ children: 'member content' }), /Sign in required/);
      assert.equal(checked, true);
    }
  }
});
test('Google OAuth callback retains Discussions as its return destination', async () => {
  const handler = load('app/auth/callback/route.ts', {
    'next/server': { NextResponse: { redirect: destination => ({ location: String(destination) }) } },
    '@/lib/supabase/server': { createClient: async () => ({ auth: { exchangeCodeForSession: async () => ({ error: null }) } }) },
    '@/lib/supabase/config': { isSupabaseConfigured: () => true },
    '@/lib/site-origin': { getAuthOrigin: () => 'http://localhost:3000' },
    '@/lib/auth/navigation': { safeNextPath },
  }).GET;
  const url = new URL('http://localhost:3000/auth/callback?code=test&next=%2Fdiscussions');
  assert.equal((await handler({ url: url.href, nextUrl: url })).location, 'http://localhost:3000/discussions');
});
test('existing email/password sign-in invokes success after Supabase authentication', async () => {
  const calls = [];
  const priorFormData = globalThis.FormData;
  globalThis.FormData = class { get(name) { return { email: '  MEMBER@EXAMPLE.COM ', password: 'test-password' }[name]; } };
  try {
    const popup = load('components/AuthPopup.tsx', {
      react: { useState: value => [value, () => {}], useEffect: () => {}, useRef: () => ({ current: { reset: () => {} } }) },
      'next/image': { default: 'image' },
      '@/lib/site-origin': { getAuthOrigin: () => 'http://localhost:3000' },
      '@/lib/auth/navigation': { safeNextPath },
      '@/lib/supabase/client': { createClient: () => ({ auth: { signInWithPassword: async credentials => { calls.push(credentials); return { error: null }; } } }) },
    }).default({ open: true, initialMode: 'signin', nextPath: '/discussions', onClose: () => {}, onSuccess: () => calls.push('success') });
    const form = popup.props.children.find(child => child?.type === 'form');
    await form.props.onSubmit({ preventDefault() {}, currentTarget: {} });
    assert.deepEqual(calls, [{ email: 'member@example.com', password: 'test-password' }, 'success']);
  } finally { globalThis.FormData = priorFormData; }
});
function descendants(element) {
  if (!element || typeof element !== 'object') return [];
  if (Array.isArray(element)) return element.flatMap(descendants);
  return [element, ...descendants(element.props?.children)];
}
test('header Sign In uses the original desktop/mobile positions and authenticated account controls', () => {
  for (const authenticated of [false, true]) {
    const calls = [];
    const Header = load('components/Header.tsx', {
      react: { useState: () => [true, value => calls.push(['menu', value])], useEffect: () => {}, useRef: () => ({ current: null }) },
      'next/navigation': { usePathname: () => '/research' },
      'next/link': { default: 'link' }, 'next/image': { default: 'image' },
      '@/lib/communityCopy': { communityTabs: [] },
      '@/lib/discord/navigation': { discordJoinUrl: 'https://discord.gg/zwVuXWE8q' },
      '@/components/auth/AuthProvider': { useMemberAuth: () => ({ authenticated, openAuth: (...args) => calls.push(args) }) },
      '@/components/ProfileMenu': { default: 'profile-menu' },
      './Header.module.css': { default: { desktopSignin: 'desktop-signin', inactive: 'inactive', actionSlot: 'action-slot', avatarSlot: 'avatar-slot' } },
    }).default;
    const nodes = descendants(Header());
    const buttons = nodes.filter(node => node.type === 'button' && node.props.children === 'Sign In');
    const researchLinks = nodes.filter(node => node.props?.href === '/research');
    assert.equal(researchLinks.length, 2);
    assert.ok(researchLinks.every(link => link.props['aria-current'] === 'page' && link.props.children === 'New Releases'));
    assert.equal(buttons.length, 2);
    assert.ok(buttons[0].props.className.includes('desktop-signin'));
    assert.equal(buttons.every(button => button.props.className.includes('inactive')), authenticated);
    assert.equal(nodes.some(node => node.type === 'profile-menu'), authenticated);
    if (!authenticated) {
      buttons[0].props.onClick();
      buttons[1].props.onClick();
      assert.deepEqual(calls, [['signin', '/member'], ['menu', false], ['signin', '/member']]);
    }
  }
});
test('Coming Soon Sign In opens the existing popup and disappears after authentication', () => {
  for (const authenticated of [false, true]) {
    const calls = [];
    const Button = load('components/HomeSignInButton.tsx', {
      '@/components/auth/AuthProvider': { useMemberAuth: () => ({ authenticated, openAuth: (...args) => calls.push(args) }) },
    }).default;
    const button = Button();
    if (authenticated) assert.equal(button, null);
    else {
      assert.equal(button.props.className, 'btn home-signin');
      assert.equal(button.props.children, 'Sign In');
      button.props.onClick();
      assert.deepEqual(calls, [['signin', '/member']]);
    }
  }
});

test('New Releases links require Sign In, preserve their destination, and remain direct for members', () => {
  const visitor = provider();
  assert.equal(click(visitor, '/research'), true);
  assert.ok(visitor.calls.some(call => call[0] === 'state' && call[1] === 0 && call[2] === 'signin'));
  assert.ok(visitor.calls.some(call => call[0] === 'state' && call[1] === 1 && call[2] === '/research'));
  assert.equal(click(provider(true), '/research'), false);
  const previousWindow = globalThis.window;
  const navigations = [];
  globalThis.window = { location: { href: 'http://localhost:3000/resources', assign: path => navigations.push(path) }, history: { replaceState() {} } };
  try {
    const pending = provider(false, '/research');
    pending.popup.props.onClose();
    assert.deepEqual(navigations, []);
    pending.popup.props.onSuccess();
    assert.deepEqual(navigations, ['/research']);
  } finally { globalThis.window = previousWindow; }
});

test('initial signed-out member requests render the server redirect boundary', () => {
  for (const path of ['/research', '/discussions']) {
    assert.equal(provider(false, path, path).wrapper.props.children, 'content');
  }
});
