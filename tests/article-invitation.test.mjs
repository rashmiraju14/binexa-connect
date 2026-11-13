import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
import { isPublicArticle, publicArticleSlugs } from '../lib/auth/navigation.ts';
const require = createRequire(import.meta.url);
function load(file, mocks = {}) {
  const source = readFileSync(file, 'utf8').replace('import "server-only";', '');
  const compiled = ts.transpileModule(source, {
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const exports = {};
  new Function('require', 'exports', compiled)(name => name in mocks ? mocks[name] : require(name), exports);
  return exports;
}
const { resources } = load('lib/content.ts');
const { articleSections } = load('lib/articles.ts');
function page(signedIn) {
  return load('app/(community-site)/resources/[slug]/page.tsx', {
    '@/lib/auth/require-account': { requireAccount: async () => { if (!signedIn) throw Error('Sign in required'); } },
    '@/lib/auth/navigation': { isPublicArticle },
    '@/lib/content': { resources }, '@/lib/articles': { articleSections },
    '@/components/EditorialStories': { storyImages: {} },
    '@/components/editorial.module.css': {},
    'next/image': () => null,
    'next/link': ({ href, children }) => createElement('a', { href }, children),
    'next/navigation': { notFound: () => { throw Error('Not found'); } },
  }).default;
}
test('all public articles render complete bodies and two Home links without invitations for visitors or members', async () => {
  for (const signedIn of [false, true]) {
    for (const slug of publicArticleSlugs) {
      const html = renderToStaticMarkup(await page(signedIn)({ params: Promise.resolve({ slug }) }));
      for (const section of articleSections[slug]) assert.ok(html.includes(renderToStaticMarkup(createElement('p', null, section.body))));
      assert.equal((html.match(/href="\/"/g) || []).length, 2);
      assert.equal((html.match(/← Back to Home/g) || []).length, 2);
      assert.doesNotMatch(html, /<dialog|<form|Enjoyed this story|article-progress|All resources|Find your next story/);
    }
  }
});
test('protected article pages still reject visitors and render for verified members', async () => {
  for (const slug of ['glp1-questions', 'ai-and-healthcare', 'welcome-to-binexa-connect']) {
    await assert.rejects(page(false)({ params: Promise.resolve({ slug }) }), /Sign in required/);
    const html = renderToStaticMarkup(await page(true)({ params: Promise.resolve({ slug }) }));
    assert.ok(html.includes('<article'));
  }
});
test('article pages have no reading-trigger client wrapper; library checks access before rendering', () => {
  const source = readFileSync('app/(community-site)/resources/[slug]/page.tsx', 'utf8');
  assert.doesNotMatch(source, /ArticleReader|IntersectionObserver|sessionStorage|openAuth|onScroll|onClick/);
  const library = readFileSync('app/(community-site)/resources/page.tsx', 'utf8');
  assert.ok(library.indexOf('await requireAccount("/resources")') < library.indexOf('return <main>'));
  assert.ok(library.includes('await requireAccount("/resources")'));
});
