import { after, NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { recordSignIn } from "@/lib/auth/sign-in-sheet";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  if (!process.env.GOOGLE_SIGNIN_WEBHOOK_URL || !process.env.GOOGLE_SIGNIN_WEBHOOK_SECRET) return NextResponse.json({ configured: false }, { status: 503 });
  after(async () => {
    try { await recordSignIn(user); }
    catch { console.error("[Sign-in sheet] Delivery failed; retry on next authenticated visit."); }
  });
  return NextResponse.json({ queued: true }, { status: 202, headers: { "Cache-Control": "no-store" } });
}
