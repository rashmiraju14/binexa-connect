"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

export type AuthMode = "signup" | "signin";
type AuthPopupProps = {
  open: boolean;
  onClose: () => void;
  initialMode?: AuthMode;
  initialMessage?: string;
  onSuccess?: () => void;
};

export default function AuthPopup({ open, onClose, initialMode = "signup", initialMessage = "", onSuccess }: AuthPopupProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [loading, setLoading] = useState(false);
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
            emailRedirectTo: `${window.location.origin}/auth/confirm`,
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
        {message && <p className="binexa-auth-message" role="status">{message}</p>}
        <button type="submit" className="binexa-auth-submit" disabled={loading}>{loading ? "Please wait…" : mode === "signup" ? "Create My Free Account →" : "Sign In →"}</button>
      </form>}
      <p className="binexa-auth-switch">{mode === "signup" ? "Already a member? " : "New to Binexa Connect? "}<button type="button" disabled={loading} onClick={() => { setMode(mode === "signup" ? "signin" : "signup"); setMessage(""); }}>{mode === "signup" ? "Sign In" : "Create Account"}</button></p>
      <p className="binexa-auth-footer">Your information is handled securely. Community information is educational and not medical advice.</p>
    </dialog>
  );
}
