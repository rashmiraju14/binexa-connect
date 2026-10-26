import "server-only";
import { createHmac } from "node:crypto";
import type { User } from "@supabase/supabase-js";

export async function recordSignIn(user: User): Promise<boolean> {
  const endpoint = process.env.GOOGLE_SIGNIN_WEBHOOK_URL;
  const secret = process.env.GOOGLE_SIGNIN_WEBHOOK_SECRET;
  if (!endpoint || !secret) return false;
  const url = new URL(endpoint);
  if (url.origin !== "https://script.google.com" || !/^\/(?:a\/macros\/[^/]+\/s|macros\/s)\/[^/]+\/exec$/.test(url.pathname)) throw new Error("Invalid sign-in sheet endpoint");
  if (!user.last_sign_in_at) return false;
  const payload = JSON.stringify({
    sentAt: Date.now(), userId: user.id,
    name: typeof user.user_metadata?.username === "string" ? user.user_metadata.username.slice(0, 200) : "",
    email: user.email || "", signedInAt: user.last_sign_in_at,
    phone: user.phone || (typeof user.user_metadata?.phone === "string" ? user.user_metadata.phone.slice(0, 50) : ""),
  });
  const signature = createHmac("sha256", secret).update(payload).digest("hex");
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ payload, signature }), cache: "no-store", signal: AbortSignal.timeout(7000) });
      if (response.ok && (await response.json()).ok === true) return true;
    } catch { /* A retry uses the same event; the receiver deduplicates it. */ }
  }
  throw new Error("Sign-in sheet delivery failed");
}
