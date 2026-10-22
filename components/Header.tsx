"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { communityTabs } from "@/lib/communityCopy";
import { useMemberAuth } from "@/components/auth/AuthProvider";
import { discordJoinUrl, discordJoinLabel } from "@/lib/discord/navigation";

const links = [["Explore", "/explore"], ["Discussions", "/discussions"], ["Resources", "/resources"], ["Health Topics", "/offerings"], ["Events", "/events"]];

export default function Header() {
  const [open, setOpen] = useState(false);
  const { authenticated, openAuth } = useMemberAuth();
  const menuButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); menuButton.current?.focus(); }
    };
    const desktop = window.matchMedia("(min-width: 1001px)");
    const closeOnDesktop = () => { if (desktop.matches) setOpen(false); };
    window.addEventListener("keydown", closeOnEscape);
    desktop.addEventListener("change", closeOnDesktop);
    return () => { window.removeEventListener("keydown", closeOnEscape); desktop.removeEventListener("change", closeOnDesktop); };
  }, [open]);

  function navigate(event: MouseEvent<HTMLAnchorElement>, destination: string) {
    setOpen(false);
    if (!authenticated) { event.preventDefault(); openAuth("signup", destination); }
  }
  return <>
    <div className="topbar">BINEXA HEALTH · PERSONALIZED CARE. BETTER CONNECTIONS.</div>
    <header className="header">
      <div className="shell headrow">
        <Link href="/" className="logo"><Image src="/brand/binexa-favicon.png" alt="Binexa Health gold and navy emblem" width={51} height={51} className="logomark" /><span className="brandtext">Binexa <span>Connect</span></span></Link>
        <nav className="nav">
          {links.map(([label, url]) => <Link key={url} href={url}>{label}</Link>)}
          {authenticated && <Link href="/member">My Account</Link>}
          <button type="button" className="btn header-signin" data-auth-trigger onClick={() => openAuth("signin", "/member")}>Sign In</button>
          <a className="btn ghost header-discord" href={discordJoinUrl} target="_blank" rel="noopener noreferrer">Join Discord ↗</a>
        </nav>
        <button type="button" ref={menuButton} data-auth-trigger aria-label={open ? "Close menu" : "Open menu"} aria-controls="mobile-navigation" aria-expanded={open} className="btn ghost menu" onClick={() => setOpen(!open)}>{open ? <X size={19} /> : <Menu size={19} />}</button>
      </div>
      <nav className="community-subnav shell" aria-label="Community activities">
        {communityTabs.map(tab => <Link key={tab.href} href={tab.href}>{tab.title}</Link>)}
      </nav>
      {open && <nav id="mobile-navigation" className="nav-mobile" aria-label="Mobile navigation" data-auth-trigger>
        {links.map(([label, url]) => <Link key={url} href={url} onClick={event => navigate(event, url)}>{label}</Link>)}
        {communityTabs.map(tab => <Link key={tab.href} href={tab.href} onClick={event => navigate(event, tab.href)}>{tab.title}</Link>)}
        {authenticated && <Link href="/member" onClick={() => setOpen(false)}>My Account</Link>}
        <button type="button" className="btn header-signin" data-auth-trigger onClick={() => { setOpen(false); openAuth("signin", "/member"); }}>Sign In</button>
        <a className="btn ghost header-discord" href={discordJoinUrl} target="_blank" rel="noopener noreferrer" onClick={event => { setOpen(false); if (!authenticated) { event.preventDefault(); openAuth("signup"); } }}>{discordJoinLabel} →</a>
      </nav>}
    </header>
  </>;
}
