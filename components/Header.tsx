"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { communityTabs, communityCopy } from "@/lib/communityCopy";
import { useMemberAuth } from "@/components/auth/AuthProvider";
import { discordJoinUrl, discordJoinLabel } from "@/lib/discord/navigation";

const links = [["Explore", "/explore"], ["Discussions", "/discussions"], ["Resources", "/resources"], ["Health Topics", "/offerings"], ["Events", "/events"]];

export default function Header() {
  const [open, setOpen] = useState(false);
  const { authenticated, openAuth } = useMemberAuth();
  return <>
    <div className="topbar">BINEXA HEALTH · PERSONALIZED CARE. BETTER CONNECTIONS.</div>
    <header className="header">
      <div className="shell headrow">
        <Link href="/" className="logo"><Image src="/brand/binexa-favicon.png" alt="Binexa Health gold and navy emblem" width={51} height={51} className="logomark" /><span className="brandtext">Binexa <span>Connect</span></span></Link>
        <nav className="nav">
          {links.map(([label, url]) => <Link key={url} href={url}>{label}</Link>)}
          {authenticated && <Link href="/member">My Account</Link>}
          <button type="button" className="auth-nav-link" data-auth-trigger onClick={() => openAuth("signin", "/member")}>Sign In</button>
          <button type="button" className="btn" data-auth-trigger onClick={() => openAuth("signup")}>{communityCopy.hero.cta}</button>
        </nav>
        <button type="button" data-auth-trigger aria-label="Toggle menu" aria-expanded={open} className="btn ghost menu" onClick={() => setOpen(!open)}>{open ? <X size={19} /> : <Menu size={19} />}</button>
      </div>
      <nav className="community-subnav shell" aria-label="Community activities">
        {communityTabs.map(tab => <Link key={tab.href} href={tab.href}>{tab.title}</Link>)}
        <a href={discordJoinUrl} target="_blank" rel="noopener noreferrer">{discordJoinLabel} →</a>
      </nav>
      {open && <nav className="nav-mobile">
        {links.map(([label, url]) => <Link key={url} href={url} onClick={() => setOpen(false)}>{label}</Link>)}
        {communityTabs.map(tab => <Link key={tab.href} href={tab.href} onClick={() => setOpen(false)}>{tab.title}</Link>)}
        {authenticated && <Link href="/member" onClick={() => setOpen(false)}>My Account</Link>}
        <button type="button" className="auth-nav-link" data-auth-trigger onClick={() => { setOpen(false); openAuth("signin", "/member"); }}>Sign In</button>
        <button type="button" className="auth-nav-link" data-auth-trigger onClick={() => { setOpen(false); openAuth("signup"); }}>{communityCopy.hero.cta} →</button>
        <a href={discordJoinUrl} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>{discordJoinLabel} →</a>
      </nav>}
    </header>
  </>;
}
