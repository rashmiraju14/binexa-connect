import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
const require = createRequire(import.meta.url);
function load(file, mocks = {}) {
  const output = ts.transpileModule(readFileSync(file, 'utf8'), { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const exports = {};
  new Function('require', 'exports', output)(name => name in mocks ? mocks[name] : require(name), exports);
  return exports;
}
const data = load('lib/recommended-podcasts.ts');
function nodes(element) {
  if (!element || typeof element !== 'object') return [];
  if (Array.isArray(element)) return element.flatMap(nodes);
  return [element, ...nodes(element.props?.children)];
}
function view() {
  const states = ['All Podcasts', null];
  let index = 0;
  const component = load('components/events/RecommendedPodcasts.tsx', {
    react: { useState: () => { const current = index++; return [states[current], value => { states[current] = typeof value === 'function' ? value(states[current]) : value; }]; } },
    '@/lib/recommended-podcasts': data,
    './RecommendedPodcasts.module.css': { default: {} },
  }).default;
  const render = () => { index = 0; return component(); };
  const click = label => {
    const button = nodes(render()).find(node => node.type === 'button' && (node.props.children === label || (Array.isArray(node.props.children) && node.props.children.includes(label))));
    assert.ok(button, label); button.props.onClick();
  };
  return { render, click };
}
test('all seven requested podcasts have safe publisher links and neutral square cover treatment', () => {
  const html = renderToStaticMarkup(view().render());
  assert.equal(data.recommendedPodcasts.length, 7);
  assert.equal(new Set(data.recommendedPodcasts.map(item => item.url)).size, 7);
  assert.equal((html.match(/data-podcast-id=/g) || []).length, 7);
  assert.ok(!html.includes('<img'));
  assert.ok(!html.includes('<iframe'));
  assert.ok(html.includes(data.recommendedDisclaimer));
  for (const podcast of data.recommendedPodcasts) {
    assert.equal(new URL(podcast.url).protocol, 'https:');
    if (podcast.youtubeUrl) { assert.equal(new URL(podcast.youtubeUrl).hostname, 'www.youtube.com'); assert.ok(podcast.channelVerificationUrl); }
  }
});
test('every category filters the podcast cards and recommended episodes, and All restores all seven', () => {
  const page = view();
  for (const category of data.recommendedCategories) {
    page.click(category);
    const tree = nodes(page.render());
    const ids = tree.filter(node => node.props?.['data-podcast-id']).map(node => node.props['data-podcast-id']);
    assert.deepEqual(ids, data.filterRecommendedPodcasts(category).map(item => item.id));
    assert.ok(ids.length > 0, category);
    const episodes = tree.filter(node => node.props?.['data-episode-id']).map(node => node.props['data-episode-id']);
    assert.deepEqual(episodes, data.filterRecommendedEpisodes(category).map(item => item.id));
  }
  page.click('All Podcasts');
  assert.equal(nodes(page.render()).filter(node => node.props?.['data-podcast-id']).length, 7);
});
test('official video embed is click-to-load, can close, and never autoplays', () => {
  const page = view();
  page.click('Watch here');
  const iframe = nodes(page.render()).find(node => node.type === 'iframe');
  assert.equal(iframe.props.src, 'https://www.youtube-nocookie.com/embed/XZlsjAVwaPI');
  assert.ok(!iframe.props.src.includes('autoplay'));
  const close = nodes(page.render()).find(node => node.type === 'button' && node.props['aria-label'] === 'Close embedded episode');
  close.props.onClick();
  assert.ok(!nodes(page.render()).some(node => node.type === 'iframe'));
});
test('recommendations appear only on the podcast browsing page, not the main Events page', () => {
  const events = readFileSync('components/events/EventsMedia.tsx', 'utf8');
  assert.doesNotMatch(events, /RecommendedPodcasts/);
  assert.match(readFileSync('lib/podcast-discovery.ts', 'utf8'), /recommendedPodcasts\.map/);
  assert.doesNotMatch(readFileSync('components/events/PodcastLibrary.tsx', 'utf8'), /<RecommendedPodcasts|Recommended Episodes|The Wellness Listening Room/);
  assert.doesNotMatch(readFileSync('components/events/RecommendedPodcasts.tsx', 'utf8'), /AuthPopup|openAuth|requireAccount/);
});
