import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
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
const { nextResource } = load('lib/resource-navigation.ts', { './content': { resources }, './articles': { articleSections } });
const Home = () => createElement('a', { href: '/' }, '← Back to Home');
function page(signedIn) {
  return load('app/(community-site)/resources/[slug]/page.tsx', {
    '@/lib/auth/require-account': { requireAccount: async () => { if (!signedIn) throw Error('Sign in required'); } },
    '@/components/BackToHome': Home, '@/lib/resource-navigation': { nextResource },
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
    for (const { slug } of resources) {
      const html = renderToStaticMarkup(await page(signedIn)({ params: Promise.resolve({ slug }) }));
      for (const section of articleSections[slug]) assert.ok(html.includes(renderToStaticMarkup(createElement('p', null, section.body))));
      assert.equal((html.match(/href="\/"/g) || []).length, 2);
      assert.equal((html.match(/← Back to Home/g) || []).length, 2);
      assert.doesNotMatch(html, /<dialog|<form|Enjoyed this story|article-progress|All resources|Find your next story/);
    }
  }
});
test('unknown articles return not found instead of prompting for authentication', async () => {
  await assert.rejects(page(false)({ params: Promise.resolve({ slug: 'unpublished-draft' }) }), /Not found/);
});
test('article pages and the library have no reading or authentication triggers', () => {
  for (const file of ['app/(community-site)/resources/[slug]/page.tsx', 'app/(community-site)/resources/page.tsx']) {
    assert.doesNotMatch(readFileSync(file, 'utf8'), /requireAccount|ArticleReader|IntersectionObserver|sessionStorage|openAuth|onScroll|onClick/);
  }
});

test('Next follows the published Resources Library order without wrapping or accepting unknown items', async () => {
  for (const [index, resource] of resources.entries()) {
    const expected = resources[index + 1];
    assert.equal(nextResource(resource.slug)?.slug, expected?.slug);
    const html = renderToStaticMarkup(await page(false)({ params: Promise.resolve({ slug: resource.slug }) }));
    assert.equal(html.includes('Next →'), Boolean(expected));
    if (expected) assert.ok(html.includes(`href="/resources/${expected.slug}"`));
  }
  assert.equal(nextResource('unpublished-draft'), undefined);
});
