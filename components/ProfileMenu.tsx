"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { useMemberAuth } from "@/components/auth/AuthProvider";
import SignOutButton from "@/app/member/sign-out-button";
import styles from "./ProfileMenu.module.css";

export default function ProfileMenu() {
  const { user } = useMemberAuth();
  return user ? <ProfileDropdown key={user.id} user={user} />
    : <span className={styles.initial} role="status" aria-label="Loading account">…</span>;
}

function ProfileDropdown({ user }: { user: Pick<User, "id" | "email" | "user_metadata"> }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const id = useId();
  const metadata = user.user_metadata;
  const metadataName = [metadata?.given_name, metadata?.full_name, metadata?.name, metadata?.username]
    .find((value): value is string => typeof value === "string" && value.trim().length > 0
      && value.trim().length <= 100 && /^\p{L}[\p{L}\p{M}\s'’\-]*$/u.test(value.trim()));
  const emailName = user.email?.split("@")[0].replace(/[._+\-]+/g, " ").trim();
  const displayName = metadataName?.trim() || emailName || "Your account";
  const initial = Array.from(displayName)[0].toLocaleUpperCase();

  useEffect(() => {
    if (!open) return;
    panel.current?.querySelector<HTMLElement>("a, button")?.focus();
    function outside(event: PointerEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }
    function escape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        trigger.current?.focus();
      }
    }
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  function close() { setOpen(false); trigger.current?.focus(); }

  return <div ref={root} className={styles.root} data-auth-trigger
    onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
    <button ref={trigger} type="button" className={styles.initial} aria-label="Open account menu"
      aria-expanded={open} aria-controls={id} onClick={() => setOpen(value => !value)}
      onKeyDown={event => { if (event.key === "ArrowDown") { event.preventDefault(); setOpen(true); } }}>
      {initial}
    </button>
    <div ref={panel} id={id} className={styles.panel} hidden={!open} aria-label="Your account">
      <span className={`${styles.initial} ${styles.large}`} aria-hidden="true">{initial}</span>
      <strong className={styles.name}>{displayName}</strong>
      {user.email && <span className={styles.email}>{user.email}</span>}
      <Link href="/member" className={styles.manage} onClick={close}>Manage Account</Link>
      <div className={styles.signout} onClick={event => {
        if ((event.target as HTMLElement).closest("button")) close();
      }}><SignOutButton /></div>
    </div>
  </div>;
}
