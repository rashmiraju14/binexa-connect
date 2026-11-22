import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { uuidPattern, validMutation } from '@/lib/discussions/shared';

export const dynamic = 'force-dynamic';
const headers = { 'Cache-Control': 'private, no-store, max-age=0', Vary: 'Cookie', 'X-Content-Type-Options': 'nosniff' };
function json(body: unknown, status = 200) { return NextResponse.json(body, { status, headers }); }
function failure(error: { code?: string; message?: string }) {
  if (['PGRST202', 'PGRST205', '42P01', '42883'].includes(error.code || '')) return json({ error: 'The discussion database is not set up yet. The administrator needs to apply the discussion migration.', setupRequired: true }, 503);
  if (error.code === '42501') return json({ error: 'Your account cannot perform this action. Sign in again or contact the community administrator.' }, 403);
  if (error.code === 'P0002') return json({ error: 'This discussion or reply is no longer available.' }, 404);
  if (error.code === 'P0003') return json({ error: 'You are posting too quickly. Please wait before trying again.' }, 429);
  if (['22023', '23514', '23505', '22P02'].includes(error.code || '')) return json({ error: 'Please check the form. Use plain text, keep within the character limits, and avoid duplicate submissions.' }, 400);
  return json({ error: 'The discussion service could not complete your request. Please try again.' }, 500);
}
async function memberClient() {
  const client = await createClient();
  const { data: { user }, error } = await client.auth.getUser();
  return error || !user || user.is_anonymous ? null : client;
}
export async function GET(request: NextRequest) {
  try {
    const client = await memberClient();
    if (!client) return json({ error: 'Please sign in to view member discussions.' }, 401);
    const p = request.nextUrl.searchParams;
    const id = p.get('id');
    if (id && !uuidPattern.test(id)) return json({ error: 'Invalid discussion.' }, 400);
    const { data, error } = await client.rpc('discussion_read', { options: { id, query: (p.get('query') || '').slice(0, 150), category: p.get('category') || '', offset: Math.max(0, Number(p.get('offset')) || 0), reply_offset: Math.max(0, Number(p.get('reply_offset')) || 0), sort: p.get('sort') || 'latest', limit: Math.min(100, Math.max(20, Number(p.get('limit')) || 20)), reply_limit: Math.min(500, Math.max(50, Number(p.get('reply_limit')) || 50)), admin: p.get('admin') === 'true' } });
    return error ? failure(error) : json(data);
  } catch { return json({ error: 'The discussion service is temporarily unavailable.' }, 503); }
}
export async function POST(request: NextRequest) {
  if (request.headers.get('origin') !== request.nextUrl.origin || request.headers.get('sec-fetch-site') === 'cross-site') return json({ error: 'Please submit from the Binexa Connect website.' }, 403);
  if (!request.headers.get('content-type')?.startsWith('application/json')) return json({ error: 'JSON is required.' }, 415);
  try {
    const client = await memberClient();
    if (!client) return json({ error: 'Please sign in before posting.' }, 401);
    const reader = request.body?.getReader();
    if (!reader) return json({ error: 'A request body is required.' }, 400);
    const decoder = new TextDecoder();
    let text = ''; let length = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > 32_000) { await reader.cancel(); return json({ error: 'Your message is too large.' }, 413); }
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
    let body: unknown;
    try { body = JSON.parse(text); } catch { return json({ error: 'Invalid request.' }, 400); }
    if (!validMutation(body)) return json({ error: 'Invalid discussion action.' }, 400);
    const { data, error } = await client.rpc('discussion_write', { action: body.action, payload: body.payload, request_id: body.requestId });
    return error ? failure(error) : json({ result: data });
  } catch { return json({ error: 'The discussion service is temporarily unavailable.' }, 503); }
}
