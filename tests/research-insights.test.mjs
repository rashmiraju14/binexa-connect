import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
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
const releaseData = load('lib/new-releases.ts', { './learning': { learningItems } });
function view(props = {}) {
  let selected = 'All Updates';
  const Component = load('components/ResearchInsights.tsx', {
    react: { useState: () => [selected, value => { selected = value; }] },
    'next/link': { default: ({ href, children }) => createElement('a', { href }, children) },
    '@/lib/new-releases': releaseData,
    './ResearchInsights.module.css': { default: {} },
  }).default;
  return {
    Component,
    render: () => Component(props),
    click: label => {
      const button = nodes(Component(props)).find(node => node.type === 'button' && node.props.children === label);
      assert.ok(button, label);
      button.props.onClick();
    },
  };
}
test('all category filters select only the corresponding sources, including the single Peptides slot', () => {
  const research = view({ peptides: createElement('article', null, 'Original Peptides card') });
  assert.deepEqual(nodes(research.render()).filter(node => node.props?.['aria-pressed'] !== undefined).map(node => node.props.children), releaseData.releaseCategories);
  const expected = { 'All Updates': 11, 'Weight Health': 3, Longevity: 3, "Men's Health": 1, 'Preventive Health': 2, 'Healthcare Technology': 1, 'Skin Care': 1 };
  for (const [category, count] of Object.entries(expected)) {
    research.click(category);
    const entries = nodes(research.render()).filter(node => node.props?.['data-release-id']);
    assert.equal(entries.length, count, category);
    assert.ok(entries.every(node => node.props['data-release-id'] === 'peptides' ? ['All Updates', 'Skin Care'].includes(category) : category === 'All Updates' || releaseData.newReleases.find(item => item.id === node.props['data-release-id']).category === category));
  }
  research.click('All Updates');
  assert.equal(nodes(research.render()).filter(node => node.props?.['data-release-id'] === 'peptides').length, 1);
});
test('cards contain editorial labels, original attribution, verified dates and safe source links', () => {
  const cards = nodes(view().render()).filter(node => node.type === 'article');
  assert.equal(cards.length, 10);
  for (const card of cards) {
    const source = releaseData.newReleases.find(item => item.id === card.props['data-release-id']);
    const html = renderToStaticMarkup(card);
    assert.ok(html.includes('Binexa editorial summary'));
    assert.ok(html.includes(renderToStaticMarkup(createElement('p', null, source.summary)).slice(3,-4)));
    assert.ok(html.includes(renderToStaticMarkup(createElement('span', null, source.publisher)).slice(6,-7)));
    const times = nodes(card).filter(node => node.type === 'time');
    if (source.published) assert.deepEqual(times.map(node => node.props.dateTime), [source.published]);
    else { assert.equal(times.length, 0); assert.ok(html.includes('Publication date not provided by publisher')); }
    const links = nodes(card).filter(node => node.type === 'a');
    assert.equal(links.length, 1);
    assert.equal(links[0].props.href, source.url);
    assert.equal(links[0].props.target, '_blank');
    assert.equal(links[0].props.rel, 'noopener noreferrer');
    assert.equal(links[0].props.children, 'Read Original Source ↗');
    assert.equal(html.includes('<img'), Boolean(source.thumbnail));
    if (source.thumbnail) {
      assert.ok(html.includes(source.thumbnail.src));
      assert.ok(html.includes(source.thumbnail.alt));
      assert.ok(existsSync(`public${source.thumbnail.src}`));
    }
  }
});
test('eight supplied sources use verified publication dates and distinguish evidence types', () => {
  const { curatedReleases: items } = releaseData;
  assert.equal(items.length, 8);
  assert.equal(new Set(items.map(item => item.url)).size, 8);
  assert.equal(new Set(releaseData.newReleases.map(item => item.url)).size, releaseData.newReleases.length);
  const rendered = renderToStaticMarkup(view().render());
  for (const item of items) {
    assert.equal(rendered.split(`data-release-id="${item.id}"`).length - 1, 1);
    assert.ok(rendered.includes(renderToStaticMarkup(createElement('h2', null, item.title)).slice(4, -5)));
  }
  assert.deepEqual(items.map(item => [item.id, item.published]), [
    ['fda-glp1-vision','2026-11-09'], ['glp1-lean-mass','2026-03-24'], ['exercise-sleep-aging','2026-11-02'], ['young-adult-heart-health','2026-08-20'], ['sexual-cardiovascular-health','2026-08-21'], ['sleep-exercise-inflammation','2026-07-14'], ['diagnostic-safety-technology','2026-07-28'], ['lifes-essential-eight',null],
  ]);
  assert.match(items.find(item=>item.id==='glp1-lean-mass').kind, /Systematic review/);
  assert.match(items.find(item=>item.id==='exercise-sleep-aging').summary, /provisional/);
  assert.match(items.find(item=>item.id==='young-adult-heart-health').summary, /associations rather than cause and effect/);
  assert.match(items.find(item=>item.id==='sleep-exercise-inflammation').summary, /does not prove/);
  assert.match(items.find(item=>item.id==='diagnostic-safety-technology').kind, /Not a clinical study/);
  assert.equal(items.find(item=>item.id==='lifes-essential-eight').kind, 'Educational resource');
});
test('FDA is featured first, remaining publication dates descend, undated resources last, without mutating data', () => {
  const before = releaseData.newReleases.map(item=>item.id);
  const sorted = releaseData.sortReleases(releaseData.newReleases);
  assert.equal(sorted[0].id, 'fda-glp1-vision');
  assert.equal(sorted.at(-1).id, 'lifes-essential-eight');
  const dates = sorted.slice(1).filter(item=>item.published).map(item=>item.published);
  assert.deepEqual(dates,[...dates].sort().reverse());
  assert.deepEqual(releaseData.newReleases.map(item=>item.id),before);
  const cards=nodes(view().render()).filter(node=>node.type==='article');
  assert.equal(cards[0].props['data-release-id'],'fda-glp1-vision');
  assert.equal(renderToStaticMarkup(view().render()).split('Featured safety update').length-1,1);
});
test('New Releases server page blocks visitors and renders for verified members', async () => {
  for (const signedIn of [false, true]) {
    const research = view();
    const page = load('app/(community-site)/research/page.tsx', {
      '@/lib/auth/require-account': { requireAccount: async path => { assert.equal(path, '/research'); if (!signedIn) throw Error('Sign in required'); } },
      '@/components/PageHeader': { default: ({ title, subtitle }) => createElement('header', null, createElement('h1', null, title), createElement('p', null, subtitle)) },
      '@/components/LoungeArticles': { default: () => createElement('article', null, 'Peptides and Skin Care') },
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

test('Peptides card is mounted only in the protected New Releases page, not the Articles collection', () => {
  assert.doesNotMatch(readFileSync('components/WellnessMethods.tsx', 'utf8'), /LoungeArticles/);
  assert.match(readFileSync('app/(community-site)/research/page.tsx', 'utf8'), /<LoungeArticles \/>/);
});

test('the only Peptides listing and render site belong to the protected New Releases collection', () => {
  function files(directory) {
    return readdirSync(directory, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? files(`${directory}/${entry.name}`) : [`${directory}/${entry.name}`]);
  }
  const sources = ['app', 'components', 'lib'].flatMap(files).filter(file => /\.tsx?$/.test(file)).map(file => ({file, text: readFileSync(file, 'utf8')}));
  const mounts = sources.flatMap(({file, text}) => [...text.matchAll(/<LoungeArticles\b/g)].map(() => file));
  assert.deepEqual(mounts, ['app/(community-site)/research/page.tsx']);
  const titles = sources.flatMap(({file, text}) => [...text.matchAll(/Peptides and Skin Care:/g)].map(() => file));
  assert.deepEqual(titles, ['components/LoungeArticles.tsx']);
  const urls = sources.flatMap(({file, text}) => [...text.matchAll(/https:\/\/www\.nyp\.org\/healthmatters\/peptides-and-skin-care/g)].map(() => file));
  assert.deepEqual(urls, ['lib/lounge/article-metadata.ts']);
});

test('verified-member New Releases renders one featured Peptides card with original details above research', async () => {
  const metadata = load('lib/lounge/article-metadata.ts', {});
  const card = await load('components/LoungeArticles.tsx', {
    '@/lib/lounge/article-metadata': { ...metadata, getPeptideArticleMetadata: async () => ({ published: '2026-10-09', updated: '2026-11-02' }) },
  }).default();
  const page = load('app/(community-site)/research/page.tsx', {
    '@/lib/auth/require-account': { requireAccount: async path => assert.equal(path, '/research') },
    '@/components/PageHeader': { default: () => createElement('h1', null, 'New Releases') },
    '@/components/LoungeArticles': { default: () => card },
    '@/components/ResearchInsights': { default: ({ peptides }) => createElement('section', null, peptides, 'Research collection') },
  });
  const html = renderToStaticMarkup(await page.default());
  for (const detail of ['Peptides and Skin Care: Benefits, Risks and What a Dermatologist Want You to Know', 'Skin care · Expert perspective', 'NewYork-Presbyterian · Health Matters · 5 min read', 'October 9, 2026', 'November 2, 2026', 'Read the full article', 'A NewYork-Presbyterian dermatologist discusses topical peptides, the evidence behind skin-care claims, and questions to ask before adding them to your routine.']) {
    assert.equal(html.split(detail).length - 1, 1, detail);
  }
  assert.equal(html.split(`href="${metadata.peptideArticleUrl}"`).length - 1, 1);
  assert.ok(html.indexOf('Featured article') < html.indexOf('Research collection'));
  assert.match(html, /target="_blank" rel="noopener noreferrer"/);
});
