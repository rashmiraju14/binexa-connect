import { safeNextPath } from "@/lib/auth/navigation";
import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const clientId = process.env.DISCORD_CLIENT_ID;
  const missing = [
    !clientId && "DISCORD_CLIENT_ID",
    !process.env.DISCORD_CLIENT_SECRET && "DISCORD_CLIENT_SECRET",
    !process.env.DISCORD_BOT_TOKEN && "DISCORD_BOT_TOKEN",
    !process.env.DISCORD_GUILD_ID && "DISCORD_GUILD_ID",
  ].filter(Boolean);

  if (missing.length > 0) {
    console.error("[Discord] Missing environment variables:", missing.join(", "));
    return NextResponse.redirect(new URL("/join-discord?error=unavailable", origin));
  }

  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    const authQuery = new URLSearchParams({ auth: "sign-in", next: safeNextPath(request.nextUrl.pathname + request.nextUrl.search) });
    return NextResponse.redirect(new URL(`/?${authQuery}`, origin));
  }

  const state = randomBytes(32).toString("hex");
  const params = new URLSearchParams({
    client_id: clientId!,
    redirect_uri: `${origin}/api/discord/callback`,
    response_type: "code",
    scope: "identify guilds.join",
    state,
    prompt: "consent",
  });
  const response = NextResponse.redirect(`https://discord.com/oauth2/authorize?${params}`);
  const options = {
    httpOnly: true,
    secure: request.nextUrl.protocol === "https:",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 600,
  };
  response.cookies.set("discord_oauth_state", state, options);
  response.cookies.set("discord_oauth_next", safeNextPath(request.nextUrl.searchParams.get("next")), options);
  // The callback binds this authorization attempt to the original Supabase user.
  response.cookies.set("discord_oauth_user", user.id, options);
  return response;
}
