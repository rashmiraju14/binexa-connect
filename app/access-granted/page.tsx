import { safeNextPath } from "@/lib/auth/navigation";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireDiscordMembership } from "@/lib/discord/server";
import AccessGrantedDialog from "./access-granted-dialog";
import "../onboarding.css";

const DISCORD_INVITE_URL = "https://discord.gg/uGWdz6Bem";

export default async function AccessGrantedPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const params = await searchParams;
  const next = safeNextPath(Array.isArray(params.next) ? params.next[0] : params.next);

  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    const returnTo = `/access-granted?next=${encodeURIComponent(next)}`;
    redirect(`/sign-in?next=${encodeURIComponent(returnTo)}`);
  }

  // Keep the existing server-side membership verification.
  await requireDiscordMembership(user.id, next);

  return (
    <main className="onboarding-screen">
      <section className="onboarding-card onboarding-success">
        <Image
          src="/branding/binexa-icon.png"
          alt="BinexaHealth"
          width={72}
          height={72}
        />

        <p className="onboarding-eyebrow">MEMBERSHIP VERIFIED</p>

        <h1>Welcome to Binexa Connect</h1>

        <p className="onboarding-description">
          Your community is ready for you.
        </p>

        <div className="onboarding-actions">
          <a
            href={DISCORD_INVITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="onboarding-button onboarding-button-gold"
          >
            Open Our Discord Community →
          </a>

          <Link
            href={next}
            className="onboarding-button onboarding-button-outline"
          >
            Continue to Binexa Connect →
          </Link>
        </div>
      </section>

      <AccessGrantedDialog next={next} discordInviteUrl={DISCORD_INVITE_URL} />
    </main>
  );
}
