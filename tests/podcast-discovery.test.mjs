import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
function load(file, mocks = {}) {
  const output = ts.transpileModule(readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const exports = {};
  new Function('require', 'exports', output)(name => { assert.ok(name in mocks, name); return mocks[name]; }, exports);
  return exports;
}
const audio = load('lib/events-podcasts.ts');
const recommended = load('lib/recommended-podcasts.ts');
const streams = load('lib/podcast-streams.ts');
const additional = load('lib/additional-podcasts.ts');
const discovery = load('lib/podcast-discovery.ts', { './additional-podcasts': additional, './podcast-streams': streams, './events-podcasts': audio, './recommended-podcasts': recommended });
test('one discovery collection retains every original audio episode and external recommendation', () => {
  assert.equal(discovery.discoveryItems.length, 82);
  assert.equal(discovery.discoveryItems.filter(item => item.recommended).length, 7);
  assert.equal(new Set(discovery.discoveryItems.map(item => item.id)).size, 82);
  for (const episode of audio.audioEpisodes) {
    const item = discovery.discoveryItems.find(item => item.id === `audio:${episode.id}`);
    assert.strictEqual(item.audioEpisode, episode);
    assert.deepEqual([item.title, item.description, item.sourceUrl, item.published, item.durationSeconds], [episode.title, episode.summary, episode.sourceUrl, episode.published, episode.durationSeconds]);
  }
  for (const episode of recommended.recommendedEpisodes) {
    const item = discovery.discoveryItems.find(item => item.id === `external:${episode.id}`);
    assert.ok(item);
    assert.equal(item.sourceUrl, episode.url);
    assert.equal(item.title, episode.title);
    assert.equal(item.description, episode.summary);
    assert.equal(item.published, null);
    assert.equal(item.durationSeconds, null);
  }
});
test('every card uses the shared Binexa Connect cover instead of photographs', () => {
  const component = readFileSync('components/events/PodcastLibrary.tsx', 'utf8');
  assert.ok(component.includes('<PodcastCover title={item.title} category={item.category} />'));
  assert.ok(!component.includes('item.thumbnail'));
  const cover = readFileSync('components/events/PodcastCover.tsx', 'utf8');
  assert.ok(cover.includes('Binexa'));
  assert.ok(cover.includes('Connect'));
  assert.ok(!cover.includes('<Image'));
});
test('shared topic/search/series filters cover both highlighted shows and episodes', () => {
  for (const topic of discovery.discoveryTopics) assert.ok(discovery.findDiscoveryItems('', topic).length > 0, topic);
  assert.ok(discovery.findDiscoveryItems('ZOE').some(item => item.recommended));
  assert.ok(discovery.findDiscoveryItems('ZOE').some(item => item.kind === 'external'));
  assert.equal(discovery.findDiscoveryItems('no-podcast-found-test').length, 0);
  const clinic = discovery.findDiscoveryItems('', 'All topics', 'health-essentials');
  assert.equal(clinic.length, 8);
  assert.ok(clinic.some(item => item.recommended));
  const shortest = discovery.findDiscoveryItems('', 'All topics', 'mayo-talks', 'shortest');
  assert.equal(shortest[0].title, 'Carpal Tunnel Syndrome');
});

test('every recommendation plays an attributed publisher audio stream in the shared player', () => {
  for (const item of discovery.discoveryItems) {
    assert.ok(item.audioEpisode, item.id);
    assert.equal(new URL(item.audioEpisode.audioUrl).protocol, 'https:');
    assert.ok(item.audioEpisode.title);
    assert.ok(item.audioEpisode.published <= '2026-11-21');
  }
  assert.equal(discovery.discoveryItems.find(item => item.id === 'external:stanford-ai').audioEpisode.title, 'S1 Ep1: What does it mean to bring AI into health care?');
});

test('expanded library contains 75 episodes and keeps all new streams distinct from existing episodes', () => {
  assert.equal(discovery.discoveryItems.filter(item => item.kind !== 'show').length, 75);
  assert.equal(additional.additionalEpisodes.length, 37);
  assert.equal(discovery.discoveryShows.length, 15);
  const originalUrls = new Set([...audio.audioEpisodes, ...Object.values(streams.podcastStreams)].map(episode => episode.audioUrl));
  const newUrls = new Set();
  for (const episode of additional.additionalEpisodes) {
    assert.ok(!originalUrls.has(episode.audioUrl), episode.title);
    assert.ok(!newUrls.has(episode.audioUrl), episode.title);
    newUrls.add(episode.audioUrl);
    assert.ok(additional.additionalShows.some(show => show.id === episode.showId));
    assert.ok(episode.summary.length > 30);
    assert.ok(episode.durationSeconds === null || episode.durationSeconds > 0);
    assert.ok(discovery.findDiscoveryItems('', 'All topics', episode.showId).some(item => item.audioEpisode?.id === episode.id));
    assert.equal(new URL(episode.sourceUrl).protocol, 'https:');
  }
});
