/** Public credentials only. Keep literal env reads so Next.js can inline them. */
export function getSupabaseConfig(
  url = process.env.NEXT_PUBLIC_SUPABASE_URL,
  publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
) {
  const key = publishableKey?.trim() || anonKey?.trim();
  if (!url?.trim() || !key) return null;
  return { url: url.trim(), key };
}

export function isSupabaseConfigured() {
  return getSupabaseConfig() !== null;
}

export function requireSupabaseConfig() {
  const config = getSupabaseConfig();
  if (!config) {
    throw new Error(process.env.NODE_ENV !== "production"
      ? "Sign-in is not configured locally. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY) to .env.local, then restart the development server."
      : "Sign-in is temporarily unavailable. Please contact the site administrator.");
  }
  return config;
}
