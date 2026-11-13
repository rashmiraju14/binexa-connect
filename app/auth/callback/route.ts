import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
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

  const next = safeNextPath(request.nextUrl.searchParams.get("next"));
  const code = request.nextUrl.searchParams.get("code");
  if (isSupabaseConfigured() && code && !request.nextUrl.searchParams.has("error")) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        const destination = new URL(next, origin);
        return NextResponse.redirect(destination, { headers: { "Cache-Control": "no-store" } });
      }
    } catch {
      // Return a safe message without exposing provider tokens or error details.
    }
  }
  const query = new URLSearchParams({ auth: "sign-in", oauth: "failed", next });
  return NextResponse.redirect(new URL(`/?${query}`, origin), {
    headers: { "Cache-Control": "no-store" },
  });
}
