"use client";

import { createContext, useContext, useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import Image from "next/image";
import type { User } from "@supabase/supabase-js";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import AuthPopup, { type AuthMode } from "@/components/AuthPopup";
import { isMemberPath, isDiscordPath, safeNextPath } from "@/lib/auth/navigation";

const AuthContext = createContext<{
  authenticated: boolean;
  user: Pick<User, "id" | "email" | "user_metadata"> | null;
  openAuth: (mode: AuthMode, next?: string) => void;
}>({ authenticated: false, user: null, openAuth: () => {} });
export const useMemberAuth = () => useContext(AuthContext);

export function AuthProvider({ children, authenticated, initialUser = null }: { children: ReactNode; authenticated: boolean; initialUser?: Pick<User, "id" | "email" | "user_metadata"> | null }) {
  const router = useRouter();
  const pathname = usePathname();
  const queryString = useSearchParams().toString();
  const [mode, setMode] = useState<AuthMode | null>(null);
  const [next, setNext] = useState("/");
  const [initialMessage, setInitialMessage] = useState("");
  const [showDiscord, setShowDiscord] = useState(false);
  const [signedIn, setSignedIn] = useState(authenticated);
  const [user, setUser] = useState(initialUser);
  const [welcomeFirstName, setWelcomeFirstName] = useState("");
  const discordDialog = useRef<HTMLDialogElement>(null);

  useEffect(() => { setSignedIn(authenticated); }, [authenticated]);
  useEffect(() => { setUser(initialUser); }, [initialUser]);
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSignedIn(Boolean(session));
      setUser(session?.user ?? null);
      const metadata = session?.user.user_metadata;
      const firstName = [metadata?.full_name, metadata?.name, metadata?.given_name, metadata?.username]
        .filter((value): value is string => typeof value === "string" && !value.includes("@"))
        .map(value => value.trim().split(/\s+/)[0])
        .find(value => value.length <= 50 && /^\p{L}[\p{L}\p{M}]*(?:['’\-][\p{L}\p{M}]+)*$/u.test(value));
      setWelcomeFirstName(firstName || "");
      if (session && (event === "SIGNED_IN" || event === "INITIAL_SESSION")) {
        void fetch("/api/auth/sign-in-log", { method: "POST" }).catch(() => {});
      }
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
      setInitialMessage(query.get("oauth") === "failed" ? "We couldn’t complete your social sign-in. Please try again or sign in with email." : query.get("verification") === "failed" ? "Your verification link is invalid or expired. Please sign in or request a new verification email by signing up again." : "");
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
    for (const key of ["auth", "next", "verification", "discord", "oauth"]) url.searchParams.delete(key);
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
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = event.target;
    if (!(target instanceof Element) || target.closest("[data-auth-trigger]")) return;
    const anchor = target.closest<HTMLAnchorElement>("a[href]");
    if (!anchor || (anchor.target && anchor.target !== "_self") || anchor.hasAttribute("download")) return;
    const url = new URL(anchor.href, window.location.origin);
    if (url.origin !== window.location.origin) return;
    const accountLink = ["/sign-up", "/sign-in"].includes(url.pathname);
    if (signedIn) {
      if (accountLink) { event.preventDefault(); router.push("/member"); }
      return;
    }
    if (accountLink) {
      event.preventDefault();
      openAuth(url.pathname === "/sign-in" ? "signin" : "signup", safeNextPath(url.searchParams.get("next")));
      return;
    }
    if (!isMemberPath(url.pathname) && !isDiscordPath(url.pathname)) return;
    event.preventDefault();
    openAuth("signin", safeNextPath(url.pathname + url.search + url.hash));
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
    <AuthContext.Provider value={{ authenticated: signedIn, user: signedIn ? user : null, openAuth }}>
      <div className={!signedIn && (pathname === "/" || pathname === "/community") ? "community-signup-preview" : undefined} style={{ display: "contents" }} onClickCapture={intercept}>{children}</div>
      <AuthPopup open={mode !== null} initialMode={mode || "signup"} initialMessage={initialMessage} nextPath={next} onClose={close} onSuccess={authenticatedSuccessfully} />
      <dialog ref={discordDialog} className="binexa-auth-modal" aria-labelledby="discord-prompt-title" aria-describedby="discord-prompt-description" onCancel={event => { event.preventDefault(); close(); }}>
        <button type="button" className="binexa-auth-close" aria-label="Close community welcome" onClick={close}>×</button>
        <div className="binexa-auth-brand"><Image src="/branding/binexa-icon.png" alt="" width={48} height={48} /><strong>Binexa<span>Connect</span></strong></div>
        <p className="binexa-auth-eyebrow">WELCOME TO YOUR COMMUNITY</p>
        <h2 id="discord-prompt-title">{welcomeFirstName ? `Welcome, ${welcomeFirstName}!` : "Welcome to Binexa Connect!"}</h2>
        <p id="discord-prompt-description" className="binexa-auth-description">You’re signed in. Explore wellness resources, discover new ideas, and connect with your Binexa community.</p>
        <div className="binexa-discord-actions">
          <a className="btn gold" href="/community" onClick={close}>Continue Exploring Binexa Connect →</a>
        </div>
      </dialog>
    </AuthContext.Provider>
  );
}
