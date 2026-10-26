"use client";

import { useEffect, useRef, type ReactNode } from "react";

export default function FounderBiography({ id, labelledBy, children }: { id: string; labelledBy: string; children: ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLAnchorElement | null>(null);
  const previousOverflow = useRef<string | null>(null);

  function close() {
    dialogRef.current?.close();
    if (previousOverflow.current !== null) {
      document.body.style.overflow = previousOverflow.current;
      previousOverflow.current = null;
    }
    opener.current?.focus();
  }

  useEffect(() => {
    function fromName(event: MouseEvent) {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (!(event.target instanceof Element) || event.target.closest("dialog")) return;
      const trigger = event.target.closest<HTMLElement>("[data-founder-bio]");
      const requestedId = trigger?.dataset.founderBio;
      const anchor = trigger?.closest(".founder-card")?.querySelector<HTMLAnchorElement>(".founder-name-link") ?? (trigger instanceof HTMLAnchorElement ? trigger : null);
      if (requestedId !== id) return;
      event.preventDefault();
      event.stopPropagation();
      const dialog = dialogRef.current;
      if (!dialog || dialog.open) return;
      opener.current = anchor;
      previousOverflow.current = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      dialog.showModal();
    }
    document.addEventListener("click", fromName, true);
    return () => {
      document.removeEventListener("click", fromName, true);
      if (previousOverflow.current !== null) document.body.style.overflow = previousOverflow.current;
    };
  }, [id]);

  return <dialog ref={dialogRef} id={id} className="founder-bio-dialog" data-auth-trigger aria-labelledby={labelledBy} onCancel={event => { event.preventDefault(); close(); }} onClick={event => {
    if (event.target !== event.currentTarget) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) close();
  }}>
    <button type="button" className="binexa-auth-close" aria-label="Close biography" onClick={close}>×</button>
    <div className="founder-bio-content">{children}</div>
  </dialog>;
}
