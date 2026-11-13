import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthOrigin } from "@/lib/site-origin";
import { safeNextPath } from "@/lib/auth/navigation";

export async function GET(request: NextRequest) {
  let origin: string;
  try {
    origin = getAuthOrigin(request.url, undefined, undefined,
      process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []);
  } catch {
    return NextResponse.json({ error: "Unsupported authentication origin" }, { status: 400 });
  }
  const provider = request.nextUrl.searchParams.get("provider");
  if (provider !== "google") {
    return NextResponse.json({ error: "Unsupported sign-in provider" }, { status: 400 });
  }
  const next = safeNextPath(request.nextUrl.searchParams.get("next"));
  const callback = new URL("/auth/callback", origin);
  callback.searchParams.set("next", next);
  try {
    const supabase = await createClient();
    // The server writes the PKCE verifier cookie before redirecting. Browser auth
    // locks or storage access cannot hold the account dialog in a loading state.
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: callback.href, skipBrowserRedirect: true },
    });
    if (!error && data.url) {
      return NextResponse.redirect(data.url, { headers: { "Cache-Control": "no-store" } });
    }
  } catch {
    // Keep provider details and credentials out of the public error message.
  }
  const query = new URLSearchParams({ auth: "sign-in", oauth: "failed", next });
  return NextResponse.redirect(new URL(`/?${query}`, origin), {
    headers: { "Cache-Control": "no-store" },
  });
}
