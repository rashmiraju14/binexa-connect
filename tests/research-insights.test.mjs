import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
const require = createRequire(import.meta.url);
function load(file, mocks) {
  const compiled = ts.transpileModule(readFileSync(file, 'utf8'), {
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const exports = {};
  new Function('require', 'exports', compiled)(name => name in mocks ? mocks[name] : require(name), exports);
  return exports;
}
function nodes(element) {
  if (!element || typeof element !== 'object') return [];
  if (Array.isArray(element)) return element.flatMap(nodes);
  return [element, ...nodes(element.props?.children)];
}
const { learningItems } = load('lib/learning.ts', { '@/lib/discord/navigation': { discordJoinUrl: 'https://discord.gg/zwVuXWE8q' } });
function view() {
  let selected = 'Latest Research';
  const Component = load('components/ResearchInsights.tsx', {
    react: { useState: () => [selected, value => { selected = value; }] },
    'next/link': { default: ({ href, children }) => createElement('a', { href }, children) },
    '@/lib/learning': { learningItems },
    './ResearchInsights.module.css': { default: {} },
  }).default;
  return {
    Component,
    render: () => Component(),
    click: label => {
      const button = nodes(Component()).find(node => node.type === 'button' && node.props.children === label);
      assert.ok(button, label);
      button.props.onClick();
    },
  };
}
test('research filters switch sources and recover from the empty category', () => {
  const research = view();
  assert.deepEqual(nodes(research.render()).filter(node => node.props?.['aria-pressed'] !== undefined).map(node => node.props.children), ['Latest Research', 'Weight & Metabolism', 'Longevity & Wellness', "Men's Health"]);
  assert.equal(nodes(research.render()).filter(node => node.type === 'article').length, 2);
  research.click('Weight & Metabolism');
  let html = renderToStaticMarkup(research.render());
  assert.ok(html.includes('GLP-1 research beyond weight management'));
  assert.ok(!html.includes('What researchers are learning about aging'));
  research.click('Longevity & Wellness');
  html = renderToStaticMarkup(research.render());
  assert.ok(html.includes('What researchers are learning about aging'));
  assert.ok(!html.includes('GLP-1 research beyond weight management'));
  research.click("Men's Health");
  assert.equal(nodes(research.render()).filter(node => node.type === 'article').length, 0);
  assert.ok(renderToStaticMarkup(research.render()).includes('No verified research sources are listed'));
  research.click('View latest research');
  assert.equal(nodes(research.render()).filter(node => node.type === 'article').length, 2);
});
test('research cards reuse existing verified NIH links and retain original context', () => {
  const research = view();
  const cards = nodes(research.render()).filter(node => node.type === 'article');
  const urls = cards.flatMap(card => nodes(card).filter(node => node.type === 'a').map(node => node.props.href));
  assert.deepEqual(urls, [
    'https://www.nih.gov/news-events/nih-research-matters/glp-1-plus-therapy-can-reduce-heavy-drinking',
    'https://www.nih.gov/news-events/nih-research-matters/can-we-slow-aging',
  ]);
  for (const card of cards) {
    const source = learningItems.find(item => nodes(card).some(node => node.props?.href === item.url));
    const html = renderToStaticMarkup(card);
    assert.ok(html.includes(renderToStaticMarkup(createElement('p', null, source.description))));
    assert.ok(html.includes(source.date));
    assert.ok(nodes(card).filter(node => node.type === 'a').every(node => node.props.target === '_blank' && node.props.rel.includes('noopener')));
  }
});
test('New Releases server page blocks visitors and renders for verified members', async () => {
  for (const signedIn of [false, true]) {
    const research = view();
    const page = load('app/(community-site)/research/page.tsx', {
      '@/lib/auth/require-account': { requireAccount: async path => { assert.equal(path, '/research'); if (!signedIn) throw Error('Sign in required'); } },
      '@/components/PageHeader': { default: ({ title, subtitle }) => createElement('header', null, createElement('h1', null, title), createElement('p', null, subtitle)) },
      '@/components/ResearchInsights': { default: research.Component },
    });
    if (!signedIn) await assert.rejects(page.default(), /Sign in required/);
    else {
      const html = renderToStaticMarkup(await page.default());
      assert.ok(html.includes('New Releases'));
      assert.ok(html.includes('Explore the science behind better health.'));
    }
    assert.equal(page.metadata.alternates.canonical, '/research');
  }
});
test('New Releases layout independently guards the route subtree', async () => {
  for (const signedIn of [false, true]) {
    const layout = load('app/(community-site)/research/layout.tsx', {
      '@/lib/auth/require-account': { requireAccount: async path => { assert.equal(path, '/research'); if (!signedIn) throw Error('Sign in required'); } },
    }).default;
    if (!signedIn) await assert.rejects(layout({ children: 'protected content' }), /Sign in required/);
    else assert.ok(renderToStaticMarkup(await layout({ children: 'protected content' })).includes('protected content'));
  }
});
