import { NextRequest, NextResponse } from 'next/server';
import { validTranslation } from '@/lib/languages';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;
const headers = { 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' };
const reply = (body: unknown, status = 200) => NextResponse.json(body, { status, headers });
// Per-instance circuit breaker; enforce global limits on the self-hosted service.
let windowStart = 0;
let characters = 0;
export async function POST(request: NextRequest) {
  if (request.headers.get('origin') !== request.nextUrl.origin || request.headers.get('sec-fetch-site') === 'cross-site') return reply({ error: 'Please use the language selector on Binexa Connect.' }, 403);
  if (!request.headers.get('content-type')?.startsWith('application/json')) return reply({ error: 'JSON is required.' }, 415);
  const endpoint = process.env.LIBRETRANSLATE_URL;
  const cloudflareAccount = process.env.CLOUDFLARE_ACCOUNT_ID?.trim();
  const cloudflareToken = process.env.CLOUDFLARE_API_TOKEN?.trim();
  const useCloudflare = Boolean(cloudflareAccount && cloudflareToken);
  if (!endpoint && !useCloudflare) return reply({ error: 'Website translation is not configured yet. English is still available.' }, 503);
  try {
    const reader = request.body?.getReader();
    if (!reader) return reply({ error: 'Text is required.' }, 400);
    let size = 0;
    const chunks: Uint8Array[] = [];
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 80000) { await reader.cancel(); return reply({ error: 'Please translate a smaller selection.' }, 413); }
      chunks.push(value);
    }
    const body: unknown = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    if (!validTranslation(body)) return reply({ error: 'Invalid translation request.' }, 400);
    if (body.target === 'en') return reply({ translations: body.texts });
    const now = Date.now();
    if (now - windowStart > 60000) { windowStart = now; characters = 0; }
    const count = body.texts.join('').length;
    if (characters + count > 100000) return reply({ error: 'Translation is busy. Please try again shortly.' }, 429);
    characters += count;
    if (useCloudflare) {
      if (!/^[a-f0-9]{32}$/i.test(cloudflareAccount!)) throw new Error('Invalid translation configuration');
      const translations: string[] = new Array(body.texts.length);
      const signal = AbortSignal.timeout(55000);
      let next = 0;
      let providerStatus = 502;
      try {
        await Promise.all(Array.from({ length: Math.min(4, body.texts.length) }, async () => {
          while (next < body.texts.length) {
            const index = next++;
            const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${cloudflareAccount}/ai/run/@cf/meta/m2m100-1.2b`, {
              method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${cloudflareToken}` },
              body: JSON.stringify({ text: body.texts[index], source_lang: 'en', target_lang: body.target === 'zh-CN' ? 'zh' : body.target }),
              cache: 'no-store', redirect: 'error', signal,
            });
            if (!response.ok) { if (response.status === 429) providerStatus = 429; throw new Error('Translation provider unavailable'); }
            const result = await response.json();
            if (result.success !== true || typeof result.result?.translated_text !== 'string' || !result.result.translated_text.trim()) throw new Error('Invalid translation response');
            translations[index] = result.result.translated_text;
          }
        }));
      } catch {
        return reply({ error: providerStatus === 429 ? 'Translation has reached its free usage limit. Please try again later or choose English.' : 'Translation is temporarily unavailable. Please try again or choose English.' }, providerStatus);
      }
      return reply({ translations });
    }
    // Destination is server configuration only; clients cannot supply a translation URL.
    const base = new URL(endpoint!);
    if (!['http:', 'https:'].includes(base.protocol) || base.username || base.password || base.search || base.hash) throw new Error('Invalid LibreTranslate URL');
    base.pathname = `${base.pathname.replace(/\/$/, '')}/translate`;
    const response = await fetch(base, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: body.texts, source: 'auto', target: body.target === 'zh-CN' ? 'zh-Hans' : body.target, format: 'text', ...(process.env.LIBRETRANSLATE_API_KEY ? { api_key: process.env.LIBRETRANSLATE_API_KEY } : {}) }),
      cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(55000),
    });
    if (!response.ok) return reply({ error: response.status === 429 ? 'Translation is busy. Please try again shortly.' : 'Translation is temporarily unavailable. Please try again or choose English.' }, response.status === 429 ? 429 : 502);
    const result = await response.json();
    const translations = typeof result.translatedText === 'string' ? [result.translatedText] : result.translatedText;
    if (!Array.isArray(translations) || translations.length !== body.texts.length || translations.some(text => typeof text !== 'string')) throw new Error('Invalid provider response');
    return reply({ translations });
  } catch (error) {
    return reply({ error: error instanceof SyntaxError ? 'Invalid translation request.' : 'Translation is temporarily unavailable. Please try again or choose English.' }, error instanceof SyntaxError ? 400 : 502);
  }
}
