"use client";

import { createContext, useContext, useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import AuthPopup, { type AuthMode } from "@/components/AuthPopup";
import { discordJoinUrl } from "@/lib/discord/navigation";
import { isMemberPath, isDiscordPath, safeNextPath } from "@/lib/auth/navigation";

const AuthContext = createContext<{
  authenticated: boolean;
  openAuth: (mode: AuthMode, next?: string) => void;
}>({ authenticated: false, openAuth: () => {} });
export const useMemberAuth = () => useContext(AuthContext);

export function AuthProvider({ children, authenticated }: { children: ReactNode; authenticated: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const queryString = useSearchParams().toString();
  const [mode, setMode] = useState<AuthMode | null>(null);
  const [next, setNext] = useState("/");
  const [initialMessage, setInitialMessage] = useState("");
  const [showDiscord, setShowDiscord] = useState(false);
  const [signedIn, setSignedIn] = useState(authenticated);
  const discordDialog = useRef<HTMLDialogElement>(null);

  useEffect(() => { setSignedIn(authenticated); }, [authenticated]);
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSignedIn(Boolean(session));
      if (event === "SIGNED_OUT") { setShowDiscord(false); router.refresh(); }
    });
    return () => subscription.unsubscribe();
  }, [router]);

  useEffect(() => {
    const query = new URLSearchParams(queryString);
    if (query.get("discord") === "join" && signedIn) {
      setShowDiscord(true);
      setNext(safeNextPath(query.get("next")));
    }
  }, [queryString, signedIn]);

  useEffect(() => {
    const query = new URLSearchParams(queryString);
    const requested = query.get("auth");
    if (requested === "sign-in" || requested === "sign-up") {
      setNext(safeNextPath(query.get("next")));
      setMode(requested === "sign-in" ? "signin" : "signup");
      setInitialMessage(query.get("verification") === "failed" ? "Your verification link is invalid or expired. Please sign in or request a new verification email by signing up again." : "");
    }
  }, [queryString]);

  useEffect(() => {
    if (!showDiscord) return;
    const dialog = discordDialog.current;
    if (!dialog) return;
    dialog.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { dialog.close(); document.body.style.overflow = previous; };
  }, [showDiscord]);

  function clearQuery() {
    const url = new URL(window.location.href);
    for (const key of ["auth", "next", "verification", "discord"]) url.searchParams.delete(key);
    window.history.replaceState(null, "", url.pathname + url.search + url.hash);
  }

  function close() { setMode(null); setShowDiscord(false); setInitialMessage(""); clearQuery(); }

  function openAuth(requested: AuthMode, destination = "/") {
    setNext(safeNextPath(destination));
    setShowDiscord(false);
    setInitialMessage("");
    setMode(requested);
  }

  function intercept(event: MouseEvent<HTMLDivElement>) {
    if (event.defaultPrevented || event.button !== 0) return;
    const target = event.target as HTMLElement;
    // Explicit account buttons own their mode; do not replace it with preview sign-up.
    if (target.closest("[data-auth-trigger]")) return;
    const authAnchor = target.closest<HTMLAnchorElement>("a[href]");
    const authUrl = authAnchor ? new URL(authAnchor.href, window.location.origin) : null;
    if (authUrl?.origin === window.location.origin && ["/sign-in", "/sign-up", "/join"].includes(authUrl.pathname)) {
      event.preventDefault();
      event.stopPropagation();
      openAuth(authUrl.pathname === "/sign-in" ? "signin" : "signup");
      return;
    }
    // Signed-out homepage visitors see the account popup. Members navigate normally.
    // Dialogs are siblings of this wrapper so their controls remain usable.
    if (!signedIn && (pathname === "/" || pathname === "/community")) {
      event.preventDefault();
      event.stopPropagation();
      const link = (event.target as HTMLElement).closest<HTMLAnchorElement>("a[href]");
      const destination = link ? new URL(link.href, window.location.origin) : null;
      setNext(destination?.origin === window.location.origin && isMemberPath(destination.pathname)
        ? safeNextPath(destination.pathname + destination.search + destination.hash) : "/");
      setShowDiscord(false);
      setInitialMessage("");
      setMode("signup");
      return;
    }
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const anchor = (event.target as HTMLElement).closest<HTMLAnchorElement>("a[href]");
    if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
    const url = new URL(anchor.href, window.location.origin);
    if (url.origin !== window.location.origin) return;
    const accountLink = ["/sign-up", "/sign-in", "/join"].includes(url.pathname);
    if (signedIn) {
      if (accountLink) { event.preventDefault(); router.push("/member"); }
      return;
    }
    if (!accountLink && !isMemberPath(url.pathname) && !isDiscordPath(url.pathname)) return;
    event.preventDefault();
    setNext(accountLink ? "/" : safeNextPath(url.pathname + url.search + url.hash));
    setInitialMessage("");
    setMode(url.pathname === "/sign-in" || url.pathname === "/member" || isDiscordPath(url.pathname) ? "signin" : "signup");
  }

  function authenticatedSuccessfully() {
    setSignedIn(true);
    setMode(null);
    clearQuery();
    if (isDiscordPath(new URL(next, window.location.origin).pathname)) {
      router.push(safeNextPath(next));
    } else {
      setShowDiscord(true);
    }
    router.refresh();
  }

  return (
    <AuthContext.Provider value={{ authenticated: signedIn, openAuth }}>
      <div className={!signedIn && (pathname === "/" || pathname === "/community") ? "community-signup-preview" : undefined} style={{ display: "contents" }} onClickCapture={intercept}>{children}</div>
      <AuthPopup open={mode !== null} initialMode={mode || "signup"} initialMessage={initialMessage} onClose={close} onSuccess={authenticatedSuccessfully} />
      <dialog ref={discordDialog} className="binexa-auth-modal" aria-labelledby="discord-prompt-title" aria-describedby="discord-prompt-description" onCancel={event => { event.preventDefault(); close(); }}>
        <button type="button" className="binexa-auth-close" aria-label="Close Discord prompt" onClick={close}>×</button>
        <div className="binexa-auth-brand"><Image src="/branding/binexa-icon.png" alt="" width={48} height={48} /><strong>Binexa<span>Connect</span></strong></div>
        <p className="binexa-auth-eyebrow">WELCOME TO YOUR COMMUNITY</p>
        <h2 id="discord-prompt-title">Join us on Discord</h2>
        <p id="discord-prompt-description" className="binexa-auth-description">You’re signed in and can access all member content. You can also join our Discord community to connect and chat with other members.</p>
        <div className="binexa-discord-actions">
          <a className="btn gold" href={discordJoinUrl} target="_blank" rel="noopener noreferrer">Join Our Discord Community →</a>
          <a className="textlink" href={safeNextPath(next)} onClick={close}>Continue exploring Binexa Connect →</a>
        </div>
        <p className="binexa-auth-footer">The invite opens our Discord server in a new tab. Join the server there, then return here to continue exploring Binexa Connect.</p>
      </dialog>
    </AuthContext.Provider>
  );
}
