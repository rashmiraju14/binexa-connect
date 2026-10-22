import Link from "next/link";
import { safeNextPath } from "@/lib/auth/navigation";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { discordJoinUrl } from "@/lib/discord/navigation";
import SignOutButton from "@/app/member/sign-out-button";
import "../onboarding.css";

const errors: Record<string, string> = {
  unavailable: "Discord connection is not available yet. Please try again later.",
  invalid_state: "Your connection request expired. Please start again.",
  cancelled: "Discord authorization was cancelled. Connect when you are ready to join.",
  discord_token: "Discord authorization could not be completed. Please try again.",
  discord_identity: "We could not identify your Discord account. Please try again.",
  discord_join: "We could not add you to the Discord server. Please try again later.",
  verification: "We could not verify your Discord membership. Please try again shortly.",
  screening_pending: "Open our Discord server and complete its rules screening, then connect again to verify your membership.",
  database: "We could not save your membership. Please try again later.",
  already_linked: "This Discord account is already connected to another Binexa account.",
};

export default async function JoinDiscordPage({ searchParams }: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/sign-in");
  const params = await searchParams;
  const next = safeNextPath(params.next);
  const message = params.error ? errors[params.error] : null;
  return (
    <main className="onboarding-screen">
      <section className="onboarding-card" aria-labelledby="onboarding-title">
        <Link href="/" className="onboarding-brand">
          <Image src="/branding/binexa-icon.png" alt="BinexaHealth" width={52} height={52} />
          <span>BINEXA CONNECT<small>CONNECT · LEARN · THRIVE</small></span>
        </Link>
        <p className="onboarding-eyebrow">YOUR COMMUNITY STARTS HERE</p>
        <h1 id="onboarding-title">Your Community Journey Starts on Discord</h1>
        <p className="onboarding-description">
          Join BinexaHealth’s Discord community to connect, learn, and grow together.
          Your Binexa Connect account already gives you access to all website tabs. Discord is an optional way to meet and chat with the community.
        </p>

        <p className="onboarding-description">
          Use the button below to open our server invite on Discord. If you’re
          already a member, it takes you back to the community.
        </p>
        {message && <p className="onboarding-message" role="status">{message}</p>}
        <div className="onboarding-actions">
          <a href={discordJoinUrl} target="_blank" rel="noopener noreferrer" className="onboarding-button onboarding-button-gold">
            Join Our Discord Community ↗
          </a>
        </div>
        <p className="onboarding-note">
          The invite opens in a new tab. Accept the invitation and any server rules
          in Discord, then return here to continue browsing.
        </p>
        {params.error === "screening_pending" && <p className="onboarding-note">
          <a href="https://discord.gg/uGWdz6Bem" target="_blank" rel="noopener noreferrer">Open Discord to complete the server rules ↗</a>
          {" "}Then return and choose Join Our Discord Community again.
        </p>}
        <div className="onboarding-footer">
          <Link href={next}>Continue to the community →</Link>
          <SignOutButton />
        </div>
      </section>
    </main>
  );
}
