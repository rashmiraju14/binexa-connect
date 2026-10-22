"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function AccessGrantedDialog({ next = "/", discordInviteUrl }: { next?: string; discordInviteUrl?: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const restoreScroll = () => { document.body.style.overflow = previousOverflow; };
    dialog.addEventListener("close", restoreScroll);
    return () => {
      dialog.removeEventListener("close", restoreScroll);
      dialog.close();
      restoreScroll();
    };
  }, []);

  return (
    <dialog ref={dialogRef} className="onboarding-dialog" aria-labelledby="access-title" aria-describedby="access-description">
      <button className="onboarding-dialog-close" onClick={() => dialogRef.current?.close()} aria-label="Close confirmation">×</button>
      <ShieldCheck size={56} className="onboarding-success-icon" aria-hidden="true" />
      <p className="onboarding-eyebrow">COMMUNITY ACCESS GRANTED</p>
      <h2 id="access-title">You’re verified!</h2>
      <p id="access-description">Your Discord membership is confirmed. Welcome to Binexa Connect—let’s connect, learn, and thrive together.</p>
      {discordInviteUrl && <a href={discordInviteUrl} target="_blank" rel="noopener noreferrer" className="onboarding-button onboarding-button-outline">Open Our Discord Community ↗</a>}
      <Link href={next} className="onboarding-button onboarding-button-gold">Continue to the community →</Link>
    </dialog>
  );
}
