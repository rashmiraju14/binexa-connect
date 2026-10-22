import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function GET(request: NextRequest) {
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
        new URL("/?discord=join", request.url)
      );
    }
  }

  return NextResponse.redirect(
    new URL("/sign-in?verification=failed", request.url)
  );
}
