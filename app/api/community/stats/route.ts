import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { botHeaders, discordFetch, isDiscordConfigured } from "@/lib/discord/server";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isDiscordConfigured()) return NextResponse.json({ error: "Counts unavailable" }, { status: 503 });
  const admin = createAdminClient();
  const { count, error } = await admin.from("community_members")
    .select("user_id", { count: "exact", head: true }).eq("discord_verified", true);
  if (error) return NextResponse.json({ error: "Unable to load members" }, { status: 503 });
  let discordMembers: number | null = null;
  try {
    const response = await discordFetch(`/guilds/${process.env.DISCORD_GUILD_ID}?with_counts=true`, { headers: botHeaders() });
    if (response.ok) {
      const guild = await response.json();
      if (typeof guild.approximate_member_count === "number") discordMembers = guild.approximate_member_count;
    }
  } catch {
    // Preserve the database count when Discord is temporarily unavailable.
  }
  return NextResponse.json({ binexaMembers: count ?? 0, discordMembers }, {
    headers: { "Cache-Control": "private, no-store" },
  });
}
