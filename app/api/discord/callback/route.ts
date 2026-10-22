import { safeNextPath } from "@/lib/auth/navigation";
import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { botHeaders, discordFetch, isDiscordConfigured } from "@/lib/discord/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const finish = (path: string) => {
    const response = NextResponse.redirect(new URL(path, request.url));
    response.cookies.delete("discord_oauth_state");
    response.cookies.delete("discord_oauth_user");
    response.cookies.delete("discord_oauth_next");
    response.headers.set("Cache-Control", "no-store");
    response.headers.set("Referrer-Policy", "no-referrer");
    return response;
  };
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const saved = request.cookies.get("discord_oauth_state")?.value;
  if (!state || !saved || !/^[a-f0-9]{64}$/.test(state) || !/^[a-f0-9]{64}$/.test(saved) ||
      !timingSafeEqual(Buffer.from(state), Buffer.from(saved))) {
    return finish("/join-discord?error=invalid_state");
  }
  if (request.nextUrl.searchParams.has("error")) return finish("/join-discord?error=cancelled");
  if (!code) return finish("/join-discord?error=invalid_state");
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return finish("/sign-in");
  if (request.cookies.get("discord_oauth_user")?.value !== user.id) return finish("/join-discord?error=invalid_state");
  if (!isDiscordConfigured()) return finish("/join-discord?error=unavailable");

  try {
    const tokenResponse = await discordFetch("/oauth2/token", {
      method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ client_id: process.env.DISCORD_CLIENT_ID!,
        client_secret: process.env.DISCORD_CLIENT_SECRET!, grant_type: "authorization_code",
        code, redirect_uri: `${request.nextUrl.origin}/api/discord/callback` }),
    });
    if (!tokenResponse.ok) {
      const failure = await tokenResponse.json().catch(() => null);
      const knownErrors = ["invalid_client", "invalid_grant", "invalid_request", "invalid_scope", "unauthorized_client", "unsupported_grant_type"];
      const reason = knownErrors.includes(failure?.error) ? failure.error : "unknown";
      console.error("[Discord] Token exchange failed:", tokenResponse.status, reason);
      return finish("/join-discord?error=discord_token");
    }
    const token = await tokenResponse.json();
    if (typeof token.access_token !== "string") return finish("/join-discord?error=discord_token");
    const identityResponse = await discordFetch("/users/@me", { headers: { Authorization: `Bearer ${token.access_token}` } });
    if (!identityResponse.ok) return finish("/join-discord?error=discord_identity");
    const identity = await identityResponse.json();
    if (typeof identity.id !== "string" || !/^\d+$/.test(identity.id)) return finish("/join-discord?error=discord_identity");
    const memberPath = `/guilds/${process.env.DISCORD_GUILD_ID}/members/${identity.id}`;
    const join = await discordFetch(memberPath, {
      method: "PUT", headers: { ...botHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ access_token: token.access_token }),
    });
    if (!join.ok) return finish("/join-discord?error=discord_join");
    const verify = await discordFetch(memberPath, { headers: botHeaders() });
    if (!verify.ok) return finish("/join-discord?error=verification");
    const member = await verify.json();
    if (member.pending) return finish("/join-discord?error=screening_pending");
    const admin = createAdminClient();
    const { error: saveError } = await admin.from("community_members").upsert({
      user_id: user.id, discord_user_id: identity.id, discord_verified: true,
    }, { onConflict: "user_id" });
    if (saveError) console.error("[Discord] Membership save failed, database code:", saveError.code);
    if (saveError) return finish(`/join-discord?error=${saveError.code === "23505" ? "already_linked" : "database"}`);
    return finish(`/access-granted?next=${encodeURIComponent(safeNextPath(request.cookies.get("discord_oauth_next")?.value))}`);
  } catch {
    return finish("/join-discord?error=verification");
  }
}
