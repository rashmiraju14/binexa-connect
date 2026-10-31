import { getAuthOrigin } from "@/lib/site-origin";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function GET(request: NextRequest) {
  let origin: string;
  try {
    origin = getAuthOrigin(request.url, undefined, undefined,
      process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []);
  } catch {
    return NextResponse.json({ error: "Unsupported authentication origin" }, { status: 400 });
  }

  const token_hash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type");

  if (isSupabaseConfigured() && token_hash && type === "email") {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: "email",
    });

    if (!error) {
      return NextResponse.redirect(
        new URL("/?discord=join", origin)
      );
    }
  }

  return NextResponse.redirect(
    new URL("/sign-in?verification=failed", origin)
  );
}
