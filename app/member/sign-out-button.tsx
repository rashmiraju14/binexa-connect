"use client";

import { useEffect, useState } from "react";
import { isMemberPath } from "@/lib/auth/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";

export default function SignOutButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    function restore(event: PageTransitionEvent) {
      if (event.persisted) window.location.reload();
    }
    function snapshot() {
      if (isMemberPath(window.location.pathname)) document.documentElement.style.visibility = "hidden";
    }
    const subscription = isSupabaseConfigured() ? createClient().auth.onAuthStateChange(event => {
      if (event === "SIGNED_OUT") window.location.replace("/");
    }).data.subscription : null;
    window.addEventListener("pagehide", snapshot);
    window.addEventListener("pageshow", restore);
    return () => {
      subscription?.unsubscribe();
      window.removeEventListener("pagehide", snapshot);
      window.removeEventListener("pageshow", restore);
    };
  }, []);

  async function signOut() {
    setLoading(true);
    setMessage("");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      // A document navigation discards the authenticated Next.js router cache.
      window.location.replace("/");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Sign out failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
    <button
      onClick={signOut}
      disabled={loading}
      type="button"
      className="btn"
      aria-busy={loading}
    >
      {loading ? "Signing Out..." : "Sign Out"}
    </button>
    {message && <p role="alert">{message}</p>}
    </>
  );
}
