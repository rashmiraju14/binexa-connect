"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function CookieNotice() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    setVisible(!document.cookie.split("; ").includes("binexa_cookie_notice=v1"));
    const reopen = () => setVisible(true);
    window.addEventListener("binexa-cookie-notice", reopen);
    return () => window.removeEventListener("binexa-cookie-notice", reopen);
  }, []);
  function dismiss() {
    document.cookie = `binexa_cookie_notice=v1; Path=/; Max-Age=15552000; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
    setVisible(false);
  }
  if (!visible) return null;
  return <aside className="cookie-notice" aria-labelledby="cookie-title" data-auth-trigger>
    <div><h2 id="cookie-title">Your privacy matters</h2><p>We use essential cookies to keep you signed in and support secure account connections. Videos load only when you choose to play them. <Link href="/privacy#cookies">Read our Privacy &amp; Cookie Notice</Link>.</p></div>
    <button type="button" className="btn" onClick={dismiss}>Got it</button>
  </aside>;
}

export function CookieNoticeButton() {
  return <button type="button" className="footer-cookie-link" data-auth-trigger onClick={() => window.dispatchEvent(new Event("binexa-cookie-notice"))}>Cookie Notice</button>;
}
