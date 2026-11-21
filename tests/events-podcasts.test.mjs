import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
const require = createRequire(import.meta.url);
function load(file, mocks = {}) {
  const output = ts.transpileModule(readFileSync(file, 'utf8'), { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const exports = {};
  new Function('require', 'exports', output)(name => name in mocks ? mocks[name] : require(name), exports);
  return exports;
}
const data = load('lib/events-podcasts.ts');
const recommended = load('lib/recommended-podcasts.ts');
const streams = load('lib/podcast-streams.ts');
const additional = load('lib/additional-podcasts.ts');
const discovery = load('lib/podcast-discovery.ts', { './additional-podcasts': additional, './podcast-streams': streams, './events-podcasts': data, './recommended-podcasts': recommended });
test('audio catalogue has distinct, attributed episodes with dates and direct HTTPS audio', () => {
  assert.equal(data.audioEpisodes.length, 30);
  assert.equal(data.audioShows.length, 5);
  assert.equal(new Set(data.audioEpisodes.map(episode => episode.audioUrl)).size, 30);
  for (const episode of data.audioEpisodes) {
    assert.ok(data.audioShows.some(show => show.id === episode.showId));
    assert.ok(episode.published <= data.podcastVerifiedOn);
    assert.ok(episode.summary.length > 20);
    assert.ok(episode.durationSeconds > 0);
    assert.ok(['traffic.megaphone.fm', 'www.buzzsprout.com', 'mcdn.podbean.com', 'podcast.nejm.org'].includes(new URL(episode.audioUrl).hostname));
    assert.equal(new URL(episode.audioUrl).protocol, 'https:');
    assert.equal(new URL(episode.sourceUrl).protocol, 'https:');
  }
});
test('search combines topic and series filters; duration sorting is numeric and does not mutate the catalogue', () => {
  assert.ok(data.findAudioEpisodes('sLeEp').length > 0);
  assert.ok(data.findAudioEpisodes('Mayo Clinic').every(episode => episode.showId === 'mayo-talks'));
  assert.equal(data.findAudioEpisodes('no-matching-podcast-test-query').length, 0);
  const filtered = data.findAudioEpisodes('', 'Weight health', 'health-essentials');
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].id, 'health-essentials-0');
  const original = data.audioEpisodes.map(episode => episode.id);
  const sorted = data.findAudioEpisodes('', 'All topics', 'all', 'shortest');
  assert.ok(sorted.every((episode, index) => index === 0 || episode.durationSeconds >= sorted[index - 1].durationSeconds));
  assert.deepEqual(data.audioEpisodes.map(episode => episode.id), original);
});
test('podcast page is public, provides accessible filters, and requests no audio until an episode is selected', () => {
  const component = load('components/events/PodcastLibrary.tsx', {
    '@/lib/events-podcasts': data,
    './PodcastCover': { default: ({ title }) => createElement('div', { role: 'img', 'aria-label': `Binexa Connect library cover: ${title}` }, 'Binexa Connect') },
    '@/lib/podcast-discovery': discovery,
    '@/lib/recommended-podcasts': recommended,
    'next/link': { default: ({ children, ...props }) => createElement('a', props, children) },
    'next/image': { default: props => { const imageProps = { ...props }; delete imageProps.priority; delete imageProps.unoptimized; return createElement('img', imageProps); } },
    './PodcastLibrary.module.css': { default: {} },
  }).default;
  const html = renderToStaticMarkup(createElement(component));
  assert.ok(html.includes('75 episodes'));
  assert.ok(html.includes('Search podcasts'));
  assert.ok(html.includes('Podcast series'));
  assert.ok(html.includes('Sort by'));
  assert.equal((html.match(/<article/g) || []).length, 12);
  assert.ok(html.includes('Show more podcasts'));
  assert.ok(!html.includes('<audio'));
  assert.ok(html.includes(recommended.recommendedDisclaimer));
  assert.ok(!html.includes('The Wellness Listening Room'));
  assert.equal((html.match(/data-community-pick="true"/g) || []).length, 7);
  assert.doesNotMatch(readFileSync('app/(community-site)/events/podcasts/page.tsx', 'utf8'), /requireAccount|AuthPopup|openAuth/);
});
