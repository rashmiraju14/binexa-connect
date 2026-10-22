import Image from "next/image";
import { discordJoinUrl } from "@/lib/discord/navigation";
import Link from "next/link";
import { requireAccount } from "@/lib/auth/require-account";
import SignOutButton from "./sign-out-button";
import "./member.css";

export default async function MemberPage() {
  const user = await requireAccount("/member");
  const username = typeof user.user_metadata?.username === "string"
    && !user.user_metadata.username.includes("@")
    ? user.user_metadata.username : "Member";

  return (
    <main className="member-screen">
      <section className="member-card" aria-labelledby="member-title">
        <Link href="/" className="binexa-auth-brand" aria-label="Binexa Connect home">
          <Image src="/branding/binexa-icon.png" alt="" width={48} height={48} />
          <div><strong>Binexa<span>Connect</span></strong><small>YOUR WELLNESS COMMUNITY</small></div>
        </Link>
        <p className="binexa-auth-eyebrow">YOUR ACCOUNT</p>
        <h1 id="member-title">Welcome, {username}!</h1>
        <p className="binexa-auth-description">You’re signed in. Explore your community, discover wellness resources, and connect with other members.</p>
        <div className="member-actions">
          <Link href="/community" className="btn gold">Explore Binexa Connect →</Link>
          <a href={discordJoinUrl} target="_blank" rel="noopener noreferrer" className="btn ghost">Join Our Discord Community ↗</a>
        </div>
        <div className="member-signout"><SignOutButton /></div>
        <p className="binexa-auth-footer">Community content is educational and is not medical advice.</p>
      </section>
    </main>
  );
}
