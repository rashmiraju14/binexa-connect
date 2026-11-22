'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useMemberAuth } from '@/components/auth/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import type { BoardData } from './shared';

export function useBoard(parameters: string) {
  const { authenticated } = useMemberAuth();
  const [data, setData] = useState<BoardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [connection, setConnection] = useState('Connecting to live updates…');
  const [setupRequired, setSetupRequired] = useState(false);
  const [denied, setDenied] = useState(false);
  const controller = useRef<AbortController | null>(null);
  const alive = useRef(true);
  const authorized = useRef(authenticated);
  const sending = useRef(false);
  const retry = useRef<{ signature: string; id: string } | null>(null);
  const mutationController = useRef<AbortController | null>(null);
  authorized.current = authenticated && !denied;
  const clear = useCallback(() => {
    authorized.current = false;
    controller.current?.abort(); mutationController.current?.abort();
    setData(null); setDenied(true); setLoading(false);
  }, []);
  const refresh = useCallback(async () => {
    if (!authorized.current) return;
    controller.current?.abort();
    const request = new AbortController(); controller.current = request;
    try {
      const response = await fetch(`/api/discussions?${parameters}`, { cache: 'no-store', signal: request.signal });
      const body = await response.json();
      if (!alive.current || !authorized.current || request.signal.aborted) return;
      if (response.status === 401 || response.status === 403) { clear(); setError(body.error); return; }
      if (response.status === 404) setData(null);
      if (!response.ok) { setSetupRequired(Boolean(body.setupRequired)); throw new Error(body.error); }
      setData(body); setError(''); setSetupRequired(false);
    } catch (err) {
      if (alive.current && authorized.current && !request.signal.aborted) setError(err instanceof Error ? err.message : 'Unable to load discussions. Please try again.');
    } finally { if (alive.current && !request.signal.aborted) setLoading(false); }
  }, [parameters, clear]);
  useEffect(() => {
    alive.current = true;
    if (!authenticated) { clear(); return; }
    authorized.current = true; setDenied(false); setData(null);
    setLoading(true); void refresh();
    let client: ReturnType<typeof createClient> | undefined;
    let channel: ReturnType<ReturnType<typeof createClient>['channel']> | undefined;
    let subscription: { unsubscribe: () => void } | undefined;
    let debounce: ReturnType<typeof setTimeout>;
    let stopped = false;
    try {
      client = createClient();
      const auth = client.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT' || !session) { clear(); if (channel) void client?.removeChannel(channel); }
        else if (event === 'TOKEN_REFRESHED') void client?.realtime.setAuth(session.access_token);
      });
      subscription = auth.data.subscription;
      void client.auth.getSession().then(async ({ data: { session } }) => {
        if (!session || stopped) return;
        await client!.realtime.setAuth(session.access_token);
        if (stopped) return;
        channel = client!.channel('binexa:discussions', { config: { private: true } })
          .on('broadcast', { event: 'changed' }, () => { clearTimeout(debounce); debounce = setTimeout(() => void refresh(), 150); })
          .subscribe(status => { if (!stopped) setConnection(status === 'SUBSCRIBED' ? 'Live updates connected' : 'Checking for updates every 15 seconds'); });
      }).catch(() => { if (!stopped) setConnection('Checking for updates every 15 seconds'); });
    } catch { setConnection('Checking for updates every 15 seconds'); }
    const poll = setInterval(() => { if (document.visibilityState === 'visible') void refresh(); }, 15_000);
    function focus() { void refresh(); }
    window.addEventListener('online', focus); window.addEventListener('focus', focus);
    return () => {
      stopped = true; alive.current = false; controller.current?.abort(); mutationController.current?.abort();
      clearTimeout(debounce); clearInterval(poll); window.removeEventListener('online', focus); window.removeEventListener('focus', focus);
      subscription?.unsubscribe(); if (channel) void client?.removeChannel(channel);
    };
  }, [authenticated, refresh, clear]);

  async function mutate(action: string, payload: Record<string, unknown>, success: string) {
    if (sending.current || !authorized.current) return null;
    sending.current = true; setBusy(true); setError(''); setNotice('');
    const signature = JSON.stringify({ action, payload });
    if (retry.current?.signature !== signature) retry.current = { signature, id: crypto.randomUUID() };
    const request = new AbortController(); mutationController.current = request;
    try {
      const response = await fetch('/api/discussions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, payload, requestId: retry.current.id }), signal: request.signal });
      const body = await response.json();
      if (!alive.current || !authorized.current || request.signal.aborted) return null;
      if (response.status === 401) { clear(); setError(body.error); return null; }
      if (response.status === 403) void refresh();
      if (!response.ok) { if (response.status < 500) retry.current = null; throw new Error(body.error); }
      retry.current = null; setNotice(success); await refresh(); return body.result as { id: string };
    } catch (err) { if (alive.current && !request.signal.aborted) setError(err instanceof Error ? err.message : 'Unable to save. Please try again.'); return null; }
    finally { sending.current = false; if (alive.current) setBusy(false); }
  }
  return { data: authenticated && !denied ? data : null, loading, busy, error, notice, connection, setupRequired, denied: denied || !authenticated, refresh, mutate };
}
