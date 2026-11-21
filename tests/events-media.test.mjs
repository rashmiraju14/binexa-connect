import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
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
const data = load('lib/events.ts');
function components(overrides = {}) {
  return load('components/events/EventsMedia.tsx', {
    '@/lib/events': { ...data, ...overrides },
    '@/lib/discord/navigation': { discordJoinUrl: 'https://discord.gg/zwVuXWE8q' },
    '@/components/BackToHome': { default: () => createElement('a', { href: '/' }, 'Back to Home') },
    './RecommendedPodcasts': { default: () => createElement('section', { id: 'wellness-listening-room' }, 'The Wellness Listening Room') },
    'next/link': { default: ({ children, ...props }) => createElement('a', props, children) },
    'next/image': { default: props => { const imageProps = { ...props }; delete imageProps.priority; delete imageProps.unoptimized; return createElement('img', imageProps); } },
    './EventsMedia.module.css': { default: new Proxy({}, { get: (_, key) => key }) },
  });
}
test('public Events hub renders all sections, honest empty states, local assets, and verified community links', () => {
  const html = renderToStaticMarkup(createElement(components().default));
  for (const title of ['Bringing wellness', 'Watch. Listen. Learn.', 'Moments that bring us together.', 'Binexa YouTube Highlights', 'talk about next?', 'Be part of our journey.']) assert.ok(html.includes(title), title);
  assert.ok(html.includes('Our podcast episodes'));
  assert.ok(html.indexOf('aria-label="Explore Events and Media"') < html.indexOf('id="events-title"'));
  assert.ok(html.includes('The Podcast'));
  assert.ok(html.includes('Awaiting pre-launch event photos'));
  assert.ok(!html.includes('The pre-launch album'));
  assert.ok(html.includes('href="/events/highlights"'));
  assert.ok(!html.includes('id="binexa-moments"'));
  assert.ok(!html.includes('href="#binexa-moments"'));
  assert.ok(html.includes('November 20, 2026'));
  assert.ok(!html.includes('id="upcoming-events"'));
  assert.ok(html.includes('/events/podcasts'));
  assert.equal((html.match(/>Coming Soon</g) || []).length, 0);
  assert.ok(html.includes('https://discord.gg/zwVuXWE8q'));
  assert.ok(!html.includes('<iframe'));
  assert.ok(!html.includes('href="https://www.youtube.com'));
  for (const image of [...Object.values(data.editorialImages), ...data.upcomingEvents.map(event => event.image)]) {
    assert.ok(existsSync(`public${image.src}`), image.src);
    assert.ok(image.alt.length > 10);
  }
  assert.doesNotMatch(readFileSync('app/(community-site)/events/page.tsx', 'utf8'), /requireAccount|AuthPopup|openAuth|LearningLibrary/);
});
test('only configured YouTube destinations and episodes render; no autoplay', () => {
  for (const url of ['', 'javascript:alert(1)', 'https://youtube.com.evil.example/', 'https://example.com/', 'http://youtube.com/', 'https://user@youtube.com/']) assert.equal(data.youtubeDestination(url), null);
  assert.ok(data.youtubeDestination('https://www.youtube.com/@verified-example'));
  const episode = { id: 'test', title: 'Fixture episode', description: 'Fixture description', videoId: 'abcdefghijk', published: '2026-11-20', duration: '20 min' };
  const html = renderToStaticMarkup(createElement(components({ youtube: { channelUrl: 'https://www.youtube.com/@verified-example', subscribeUrl: '', playlistUrl: '', featuredEpisode: episode, episodes: [episode, { ...episode, id: 'more', title: 'Another fixture' }] } }).default));
  assert.ok(html.includes('youtube-nocookie.com/embed/abcdefghijk'));
  assert.ok(html.includes('Click Here to Watch'));
  assert.ok(html.includes('Watch Episode'));
  assert.ok(!html.includes('autoplay'));
  assert.ok(!html.includes('Subscribe on YouTube'));
});
test('video and gallery components reject invalid media and prepare accessible dialog controls', () => {
  const { VideoPlayer, MediaGallery } = components();
  assert.equal(renderToStaticMarkup(createElement(VideoPlayer, { video: { youtubeId: 'bad' }, title: 'bad' })), '');
  assert.equal(data.hasVideo({ src: '/images/events/../../secret.mp4' }), false);
  assert.equal(data.hasVideo({ src: 'https://unverified.example/video.mp4' }), false);
  assert.equal(data.hasVideo({ src: '/images/events/pre-launch/recap.mp4' }), true);
  const empty = renderToStaticMarkup(createElement(MediaGallery, { items: [], title: 'Album' }));
  assert.equal(empty, '');
  const items = Array.from({ length: 6 }, (_, i) => ({ id: String(i), kind: 'image', src: '/images/events/events-hero.webp', caption: `Fixture photo ${i}`, category: 'Fixture' }));
  const html = renderToStaticMarkup(createElement(MediaGallery, { items, title: 'Album' }));
  for (const label of ['View All Photos (6)', 'Close gallery', 'Previous image', 'Next image', 'aria-live="polite"', '<dialog']) assert.ok(html.includes(label), label);
});
