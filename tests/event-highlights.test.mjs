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
const data = load('lib/events.ts');
function page(overrides = {}) {
  return load('components/events/EventHighlights.tsx', {
    '@/lib/events': { ...data, ...overrides },
    'next/link': { default: ({ children, ...props }) => createElement('a', props, children) },
    './EventsMedia': {
      MediaGallery: ({ items }) => createElement('div', { 'data-gallery-count': items.length }, items.map(item => item.caption).join(', ')),
      VideoPlayer: ({ title }) => createElement('div', { 'data-video-title': title }),
    },
    './EventHighlights.module.css': { default: {} },
  }).default;
}
test('dedicated public highlights page shows verified event details and honest missing-media state', () => {
  const html = renderToStaticMarkup(createElement(page()));
  assert.ok(html.includes('Our moments. Our story.'));
  assert.ok(html.includes('November 20, 2026'));
  assert.ok(html.includes('Awaiting actual Binexa event photos'));
  assert.ok(!html.includes('data-gallery-count'));
  assert.ok(!html.includes('<iframe'));
  assert.ok(html.includes('href="/events"'));
  assert.doesNotMatch(readFileSync('app/(community-site)/events/highlights/page.tsx', 'utf8'), /requireAccount|openAuth|AuthPopup/);
});
test('actual configured photos, company moments, and recaps appear only on the dedicated page', () => {
  const html = renderToStaticMarkup(createElement(page({
    pastEvents: [{ ...data.pastEvents[0], gallery: [{ id: 'photo', kind: 'image', src: '/images/events/pre-launch/photo.webp', caption: 'Approved event photo', category: 'Team' }], recap: { youtubeId: 'abcdefghijk' } }],
    binexaMoments: [{ id: 'moment', kind: 'image', src: '/images/events/binexa-moments/photo.webp', caption: 'Approved team moment', category: 'Milestone' }],
  })));
  assert.ok(html.includes('data-gallery-count="2"'));
  assert.ok(html.includes('Approved event photo'));
  assert.ok(html.includes('Approved team moment'));
  assert.ok(html.includes('data-video-title'));
  const events = readFileSync('components/events/EventsMedia.tsx', 'utf8');
  assert.ok(!events.includes('The pre-launch album'));
  assert.ok(!events.includes('<MediaGallery'));
  assert.ok(events.includes('/events/highlights'));
});
