"use client";

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Languages } from 'lucide-react';
import { isLanguage, languages, type Language } from '@/lib/languages';
import styles from './LanguageSelector.module.css';

type Entry = { original: string; translated: string };
const excluded = 'script,style,noscript,code,pre,textarea,input,select,[contenteditable]:not([contenteditable="false"]),[translate="no"],.notranslate,[data-no-translate]';
function eligible(element: Element | null, text: string) {
  return element && !element.closest(excluded) && /\p{L}/u.test(text) && text.trim().length <= 5000 && !/https?:\/\/|[\w.+-]+@[\w.-]+\.[a-z]{2,}/i.test(text) && !/^\s*Binexa\s*(Connect|Health)?\s*$/i.test(text);
}
function decode(text: string) {
  // Decode entities as text without inserting provider HTML into the document.
  const area = document.createElement('textarea');
  area.innerHTML = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return area.value;
}

export default function LanguageSelector() {
  const [language, setLanguage] = useState<Language>('en');
  const [status, setStatus] = useState('');
  const pathname = usePathname();
  const textEntries = useRef(new Map<Text, Entry>());
  const attributeEntries = useRef(new Map<Element, Map<string, Entry>>());
  useEffect(() => {
    try { const saved = localStorage.getItem('binexa-language'); if (isLanguage(saved)) setLanguage(saved); } catch { /* Storage may be blocked. */ }
  }, []);
  useEffect(() => {
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    let running = false;
    let pending = false;
    let failed = false;
    const controller = new AbortController();
    const cache = new Map<string, string>();
    const texts = textEntries.current;
    const attributes = attributeEntries.current;
    function restore() {
      for (const [node, entry] of texts) if (node.isConnected && node.data === entry.translated) node.data = entry.original;
      for (const [element, entries] of attributes) for (const [name, entry] of entries) if (element.isConnected && element.getAttribute(name) === entry.translated) element.setAttribute(name, entry.original);
      texts.clear(); attributes.clear();
      document.documentElement.lang = 'en';
    }
    restore();
    // Member conversations must not be sent to an external translation provider.
    if (language === 'en' || pathname === '/discussions' || pathname.startsWith('/discussions/')) return;
    const observer = new MutationObserver(() => schedule());
    function observe() { observer.observe(document.body, { childList: true, characterData: true, attributes: true, attributeFilter: ['aria-label', 'placeholder', 'title', 'alt'], subtree: true }); }
    function schedule() {
      if (stopped || failed) return;
      if (running) { pending = true; return; }
      clearTimeout(timer);
      timer = setTimeout(() => void translate(), 180);
    }
    async function translate() {
      if (stopped || running || failed) return;
      running = true;
      pending = false;
      try {
        const targets: { original: string; apply: (translated: string) => void }[] = [];
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        let node: Node | null;
        while ((node = walker.nextNode())) {
          const text = node as Text;
          const value = text.data;
          if (!eligible(text.parentElement, value)) continue;
          const old = texts.get(text);
          if (old && value === old.translated) continue;
          targets.push({ original: value, apply: translated => {
            if (text.isConnected && text.data === value) { texts.set(text, { original: value, translated }); text.data = translated; }
          } });
        }
        for (const element of document.querySelectorAll('[aria-label],[placeholder],[title],[alt]')) {
          for (const name of ['aria-label', 'placeholder', 'title', 'alt']) {
            const value = element.getAttribute(name);
            if (!value || !eligible(element, value)) continue;
            if (attributes.get(element)?.get(name)?.translated === value) continue;
            targets.push({ original: value, apply: translated => {
              if (element.isConnected && element.getAttribute(name) === value) {
                const entries = attributes.get(element) || new Map<string, Entry>();
                entries.set(name, { original: value, translated }); attributes.set(element, entries); element.setAttribute(name, translated);
              }
            } });
          }
        }
        for (const node of texts.keys()) if (!node.isConnected) texts.delete(node);
        for (const element of attributes.keys()) if (!element.isConnected) attributes.delete(element);
        const missing = [...new Set(targets.map(target => target.original))].filter(text => !cache.has(text));
        for (let index = 0; index < missing.length;) {
          const batch: string[] = [];
          let size = 0;
          while (index < missing.length && batch.length < 80 && size + missing[index].length <= 12000) { const text = missing[index++]; batch.push(text); size += text.length; }
          const response = await fetch('/api/translate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ target: language, texts: batch }), signal: controller.signal });
          const result = await response.json();
          if (!response.ok) throw new Error(result.error || 'Translation is unavailable.');
          if (!Array.isArray(result.translations) || result.translations.length !== batch.length || result.translations.some((value: unknown) => typeof value !== 'string')) throw new Error('Translation is unavailable.');
          batch.forEach((text, i) => cache.set(text, decode(result.translations[i])));
        }
        if (stopped) return;
        observer.disconnect();
        for (const target of targets) { const translated = cache.get(target.original); if (translated !== undefined) target.apply(translated); }
        document.documentElement.lang = language;
        observe();
        setStatus('');
      } catch (error) {
        if (!stopped) {
          failed = true;
          observer.disconnect(); restore();
          setStatus(error instanceof Error ? error.message : 'Translation is unavailable.');
        }
      } finally {
        running = false;
        if (pending) schedule();
      }
    }
    observe(); schedule();
    return () => { stopped = true; controller.abort(); clearTimeout(timer); observer.disconnect(); restore(); cache.clear(); };
  }, [language, pathname]);
  function choose(value: string) {
    if (!isLanguage(value)) return;
    setStatus(value === 'en' ? '' : 'Translating…');
    setLanguage(value);
    try { localStorage.setItem('binexa-language', value); } catch { /* Use for this visit if storage is blocked. */ }
  }
  return <>
    <label className={styles.control} translate="no" data-no-translate>
      <Languages size={18} aria-hidden="true" />
      <select aria-label="Website language" className={styles.select} value={language} onChange={event => choose(event.target.value)}>
        {languages.map(item => <option value={item.code} key={item.code}>{item.label}</option>)}
      </select>
    </label>
    {status && <div className={styles.notice} role="status" translate="no" data-no-translate>{status}{status !== 'Translating…' && <><br /><button type="button" onClick={() => choose('en')}>Return to English</button></>}</div>}
  </>;
}
