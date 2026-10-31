import "server-only";
import { getSiteOrigin } from "@/lib/site-origin";
import { safeNextPath } from "@/lib/auth/navigation";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";

export const DISCORD_API = "https://discord.com/api/v10";

export function isDiscordConfigured() {
  return Boolean(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET &&
    process.env.DISCORD_BOT_TOKEN && process.env.DISCORD_GUILD_ID &&
    process.env.SUPABASE_SECRET_KEY && process.env.NEXT_PUBLIC_SITE_URL);
}

export function siteOrigin() {
  return getSiteOrigin();
}

export function discordFetch(path: string, init: RequestInit = {}) {
  return fetch(`${DISCORD_API}${path}`, {
    ...init,
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
  });
}

export function botHeaders() {
  return { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` };
}

export async function requireDiscordMembership(userId: string, next = "/") {
  const joinPath = (error?: string) => {
    const params = new URLSearchParams({ next: safeNextPath(next) });
    if (error) params.set("error", error);
    return `/join-discord?${params}`;
  };
  if (!isDiscordConfigured()) redirect(joinPath("unavailable"));
  const admin = createAdminClient();
  const { data: member, error } = await admin.from("community_members")
    .select("discord_user_id, discord_verified").eq("user_id", userId).maybeSingle();
  if (error) redirect(joinPath("database"));
  if (!member?.discord_verified || !member.discord_user_id) redirect(joinPath());

  let response: Response;
  try {
    response = await discordFetch(`/guilds/${process.env.DISCORD_GUILD_ID}/members/${member.discord_user_id}`, { headers: botHeaders() });
  } catch {
    redirect(joinPath("verification"));
  }
  if (response.status === 404) {
    await admin.from("community_members").update({ discord_verified: false }).eq("user_id", userId);
    redirect(joinPath());
  }
  if (!response.ok) redirect(joinPath("verification"));
  const membership = await response.json();
  if (membership.pending) redirect(joinPath("screening_pending"));
}
