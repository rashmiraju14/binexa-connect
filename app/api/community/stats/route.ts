import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { discordJoinUrl } from "@/lib/discord/navigation";

export const dynamic = "force-dynamic";

async function verifiedAccounts(): Promise<number | null> {
  const config = getSupabaseConfig();
  if (!config) return null;
  try {
    const supabase = createClient(config.url, config.key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await supabase.rpc("verified_account_count").abortSignal(AbortSignal.timeout(8000));
    return !error && Number.isSafeInteger(data) && data >= 0 ? data : null;
  } catch { return null; }
}

async function discordMembers(): Promise<number | null> {
  try {
    const code = new URL(discordJoinUrl).pathname.split("/").filter(Boolean).pop();
    if (!code) return null;
    const response = await fetch(`https://discord.com/api/v10/invites/${encodeURIComponent(code)}?with_counts=true`, {
      next: { revalidate: 60 }, signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return null;
    const invite = await response.json();
    return Number.isSafeInteger(invite.approximate_member_count) && invite.approximate_member_count >= 0
      ? invite.approximate_member_count : null;
  } catch { return null; }
}

export async function GET() {
  const [binexaMembers, discordCount] = await Promise.all([verifiedAccounts(), discordMembers()]);
  return NextResponse.json({ binexaMembers, discordMembers: discordCount }, {
    status: binexaMembers === null && discordCount === null ? 503 : 200,
    headers: { "Cache-Control": "no-store" },
  });
}
