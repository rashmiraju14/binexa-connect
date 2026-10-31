"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import { getAuthOrigin } from "@/lib/site-origin";
import { safeNextPath } from "@/lib/auth/navigation";
import { createClient } from "@/lib/supabase/client";

export type AuthMode = "signup" | "signin";
type AuthPopupProps = {
  open: boolean;
  onClose: () => void;
  initialMode?: AuthMode;
  initialMessage?: string;
  onSuccess?: () => void;
  nextPath?: string;
};

export default function AuthPopup({ open, onClose, initialMode = "signup", initialMessage = "", onSuccess, nextPath = "/" }: AuthPopupProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState<"google" | "facebook" | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!open) return;
    setMode(initialMode);
    setMessage(initialMessage);
  }, [open, initialMode, initialMessage]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !open) return;
    dialog.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { dialog.close(); document.body.style.overflow = previous; };
  }, [open]);

  function close() { if (!loading) onClose(); }

  async function signInWithProvider(provider: "google" | "facebook") {
    if (loading) return;
    setLoading(true);
    setProvider(provider);
    setMessage("");
    try {
      const callback = new URL("/auth/callback", getAuthOrigin(window.location.origin));
      callback.searchParams.set("next", safeNextPath(nextPath));
      const { data, error } = await createClient().auth.signInWithOAuth({
        provider,
        options: { redirectTo: callback.href, skipBrowserRedirect: true },
      });
      if (error) throw error;
      if (!data.url) throw new Error("Unable to start sign-in. Please try again.");
      window.location.assign(data.url);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to sign in. Please try again.");
      setLoading(false);
      setProvider(null);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    const fields = new FormData(event.currentTarget);
    const email = String(fields.get("email") || "").trim().toLowerCase();
    const password = String(fields.get("password") || "");
    setLoading(true);
    setMessage("");
    try {
      const supabase = createClient();
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email, password,
          options: {
            emailRedirectTo: `${getAuthOrigin(window.location.origin)}/auth/confirm`,
            data: {
              username: String(fields.get("username") || "").trim(),
              phone: String(fields.get("phone") || "").trim(),
            },
          },
        });
        if (error) throw error;
        if (!data.session) {
          setMessage("Check your email for a verification link. After confirming your account, sign in to access all member content.");
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      onSuccess?.();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to access your account. Please try again.");
    } finally { setLoading(false); }
  }

  return (
    <dialog ref={dialogRef} className="binexa-auth-modal" aria-labelledby="binexa-auth-title" aria-describedby="binexa-auth-description"
      onCancel={event => { event.preventDefault(); close(); }}
      onClick={event => {
        if (event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) close();
      }}>
      <button type="button" className="binexa-auth-close" aria-label="Close account popup" disabled={loading} onClick={close}>×</button>
      <div className="binexa-auth-brand">
        <Image src="/branding/binexa-icon.png" alt="BinexaHealth" width={48} height={48} />
        <div><strong>Binexa<span>Connect</span></strong><small>YOUR WELLNESS COMMUNITY</small></div>
      </div>
      <p className="binexa-auth-eyebrow">MEMBER ACCESS</p>
      <h2 id="binexa-auth-title">{mode === "signup" ? "Join the Binexa Connect Community" : "Welcome Back"}</h2>
      <p id="binexa-auth-description" className="binexa-auth-description">{mode === "signup" ? "Create your free account to explore wellness articles, resources, and community conversations." : "Sign in to continue exploring your Binexa Connect community."}</p>
      <div className="binexa-auth-social" aria-label="Sign in with a social account">
        <button type="button" disabled={loading} onClick={() => signInWithProvider("google")}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.9-1.75 2.98-4.33 2.98-7.36Z"/><path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.41l-3.24-2.51c-.9.6-2.04.96-3.38.96-2.6 0-4.81-1.76-5.6-4.12H3.06v2.59A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.4 13.92a6 6 0 0 1 0-3.84V7.49H3.06a10 10 0 0 0 0 9.02l3.34-2.59Z"/><path fill="#EA4335" d="M12 5.96c1.47 0 2.79.51 3.82 1.51l2.87-2.87A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.94 5.49l3.34 2.59C7.19 7.72 9.4 5.96 12 5.96Z"/></svg>
          {provider === "google" ? "Connecting to Google…" : "Continue with Google"}
        </button>
        <button type="button" disabled={loading} onClick={() => signInWithProvider("facebook")}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#1877F2" d="M24 12a12 12 0 1 0-13.88 11.85v-8.38H7.08V12h3.04V9.36c0-3.01 1.8-4.68 4.55-4.68 1.32 0 2.7.24 2.7.24v2.97h-1.52c-1.5 0-1.97.93-1.97 1.88V12h3.35l-.54 3.47h-2.81v8.38A12 12 0 0 0 24 12Z"/></svg>
          {provider === "facebook" ? "Connecting to Facebook…" : "Continue with Facebook"}
        </button>
      </div>
      <div className="binexa-auth-divider"><span>or continue with email</span></div>
      {message && <p className="binexa-auth-message" role="status">{message}</p>}
      {open && <form onSubmit={submit} key={mode}>
        {mode === "signup" && <>
          <label htmlFor="binexa-username">Username</label>
          <input id="binexa-username" name="username" autoComplete="username" minLength={3} maxLength={30} required disabled={loading} />
        </>}
        <label htmlFor="binexa-email">Email Address</label>
        <input id="binexa-email" name="email" type="email" placeholder="you@example.com" autoComplete="email" required disabled={loading} />
        {mode === "signup" && <>
          <label htmlFor="binexa-phone">Phone Number</label>
          <input id="binexa-phone" name="phone" type="tel" autoComplete="tel" required disabled={loading} />
        </>}
        <label htmlFor="binexa-password">Password</label>
        <input id="binexa-password" name="password" type="password" placeholder={mode === "signup" ? "At least 8 characters" : "Your password"} autoComplete={mode === "signup" ? "new-password" : "current-password"} minLength={mode === "signup" ? 8 : undefined} required disabled={loading} />
        <button type="submit" className="binexa-auth-submit" disabled={loading}>{loading ? "Please wait…" : mode === "signup" ? "Create My Free Account →" : "Sign In →"}</button>
      </form>}
      <p className="binexa-auth-switch">{mode === "signup" ? "Already a member? " : "New to Binexa Connect? "}<button type="button" disabled={loading} onClick={() => { setMode(mode === "signup" ? "signin" : "signup"); setMessage(""); }}>{mode === "signup" ? "Sign In" : "Create Account"}</button></p>
      <p className="binexa-auth-footer">Your information is handled securely. Community information is educational and not medical advice.</p>
    </dialog>
  );
}
