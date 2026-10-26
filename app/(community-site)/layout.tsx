import FounderBios from "@/components/FounderBios";
import CookieNotice, { CookieNoticeButton } from "@/components/CookieNotice";

import Link from "next/link";
import { Suspense } from "react";
import { AuthProvider } from "@/components/auth/AuthProvider";
import Header from "@/components/Header";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = isSupabaseConfigured() ? await createClient() : null;
  const result = supabase ? await supabase.auth.getUser() : null;
  const authenticated = Boolean(result?.data.user && !result.error);

  return (
    <Suspense fallback={<main className="shell" role="status" style={{ paddingBlock: 48 }}>Loading Binexa Connect…</main>}>
      <AuthProvider authenticated={authenticated}>
        <Header />

        {children}

        <footer className="footer">
          <div className="shell footrow">
            <div>
              <b>Binexa Connect</b>
              <br />
              <small>
                By Binexa Health · Learn. Connect. Thrive.
              </small>
            </div>

            <div className="footlinks">
              <Link href="/resources">Resources</Link>
              <Link href="/events">Events</Link>
              <Link href="/join">Join</Link>
              <Link href="/about">About Binexa</Link>
              <Link href="/privacy">Privacy Policy</Link>
              <CookieNoticeButton />
            </div>

            <small>For education only. Not medical advice.</small>
          </div>
        </footer>
        <CookieNotice />
        <FounderBios />
      </AuthProvider>
    </Suspense>
  );
}
