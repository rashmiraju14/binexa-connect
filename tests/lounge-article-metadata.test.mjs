import test from 'node:test';
import assert from 'node:assert/strict';
import { extractArticleDates } from '../lib/lounge/article-metadata.ts';

test('publisher Article dates are extracted without using unrelated website dates', () => {
  const html = `<script type="application/ld+json">{"@graph":[{"@type":"WebSite","dateModified":"2026-11-01"},{"@type":"Article","datePublished":"2026-10-09","dateModified":"2026-10-20T12:00:00Z"}]}</script>`;
  assert.deepEqual(extractArticleDates(html), {published:'2026-10-09',updated:'2026-10-20T12:00:00Z'});
});
test('unavailable or malformed source dates do not fabricate a publication or update date', () => {
  assert.deepEqual(extractArticleDates('<script type="application/ld+json">broken</script>'), {});
  assert.deepEqual(extractArticleDates('<script type="application/ld+json">{"@type":"Article","dateModified":"today"}</script>'), {});
});
