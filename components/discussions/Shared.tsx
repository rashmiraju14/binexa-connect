'use client';
import { useEffect, useRef, type ReactNode } from 'react';
import { ShieldCheck, X } from 'lucide-react';
import { categories, disclaimer, guidelines, initials, type Profile } from '@/lib/discussions/shared';
import styles from './board.module.css';
export function Identity({ profile, date }: { profile: Profile; date?: string }) {
  return <div className={styles.identity}><span className={styles.avatar}>{profile.avatar_url ? /* Validated publisher-hosted Google avatar; no arbitrary member URL. */
    // eslint-disable-next-line @next/next/no-img-element
    <img src={profile.avatar_url} alt="" width={38} height={38} referrerPolicy="no-referrer" /> : initials(profile.display_name)}</span><div><strong>{profile.display_name}</strong><small>{profile.is_admin ? 'Administrator' : 'Member'}{date && <> · <time dateTime={date}>{new Date(date).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</time></>}</small></div></div>;
}
export function Guidelines() { return <section className={styles.guidelines}><h2><ShieldCheck size={20} aria-hidden="true" />Community Guidelines</h2><ul>{guidelines.map(rule => <li key={rule}>{rule}</li>)}</ul><p>{disclaimer}</p></section>; }
export function Modal({ title, close, children }: { title: string; close: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { const dialog = ref.current; dialog?.showModal(); return () => { dialog?.close(); }; }, []);
  return <dialog ref={ref} className={styles.modal} aria-label={title} onCancel={event => { event.preventDefault(); close(); }}><header><h2>{title}</h2><button type="button" aria-label="Close dialog" onClick={close}><X size={21} /></button></header>{children}</dialog>;
}
export function Editor({ title, content, category, admin, busy, submit, cancel }: { title?: string; content?: string; category?: string; admin: boolean; busy: boolean; submit: (values: { title: string; content: string; category: string }) => void; cancel: () => void }) {
  return <form className={styles.form} onSubmit={event => { event.preventDefault(); const form = new FormData(event.currentTarget); submit({ title: String(form.get('title') || '').trim(), content: String(form.get('content') || '').trim(), category: String(form.get('category') || '') }); }}>
    <label>Discussion title<input name="title" required minLength={5} maxLength={150} defaultValue={title} autoFocus /></label>
    <label>Category<select aria-label="Category" name="category" defaultValue={category || categories[0]}>{categories.filter(c => admin || c !== 'Binexa Announcements').map(c => <option key={c}>{c}</option>)}</select></label>
    <label>Your message<textarea name="content" required maxLength={10000} rows={7} defaultValue={content} /></label><p className={styles.reminder}>Please keep medical records, contact details, and other sensitive information private. Use plain text; no HTML.</p>
    <div className={styles.actions}><button className={styles.gold} disabled={busy} type="submit">{busy ? 'Saving…' : title ? 'Save changes' : 'Publish discussion'}</button><button type="button" disabled={busy} onClick={cancel}>Cancel</button></div>
  </form>;
}
export function Moderation({ id, kind, authorId, busy, run }: { id: string; kind: string; authorId?: string; busy: boolean; run: (payload: Record<string, unknown>) => void }) {
  return <details className={styles.moderation}><summary>Administrator actions</summary><form className={styles.form} onSubmit={event => { event.preventDefault(); const f = new FormData(event.currentTarget); const operation = String(f.get('operation')); run({ id: ['restrict','unrestrict'].includes(operation) ? authorId : id, kind, operation, reason: String(f.get('reason')) }); }}>
    <label>Action<select name="operation">{[...(kind === 'discussion' ? ['pin','unpin','lock','unlock'] : []),'hide','show','remove',...(authorId ? ['restrict','unrestrict'] : [])].map(op => <option key={op} value={op}>{({ restrict: 'Restrict this member', unrestrict: 'Restore this member’s access', remove: 'Permanently remove content' } as Record<string,string>)[op] || op[0].toUpperCase()+op.slice(1)}</option>)}</select></label>
    <label>Reason (recorded in moderation log)<input name="reason" required minLength={5} maxLength={1000} /></label><button disabled={busy} type="submit">Apply action</button>
  </form></details>;
}
