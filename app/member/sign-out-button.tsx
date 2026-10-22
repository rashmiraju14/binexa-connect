"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function signOut() {
    setLoading(true);
    setMessage("");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.replace("/");
      router.refresh();
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
      style={{
        background: "transparent",
        color: "#d3deea",
        border: "1px solid #6e8297",
        borderRadius: 9,
        padding: "12px 22px",
        cursor: "pointer",
      }}
    >
      {loading ? "Signing Out..." : "Sign Out"}
    </button>
    {message && <p role="alert">{message}</p>}
    </>
  );
}
