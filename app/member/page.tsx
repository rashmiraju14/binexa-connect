import Image from "next/image";
import Link from "next/link";
import { requireAccount } from "@/lib/auth/require-account";
import SignOutButton from "./sign-out-button";
import "./member.css";

export default async function MemberPage() {
  const user = await requireAccount("/member");
  const metadata = user.user_metadata;
  const firstName = [metadata?.given_name, metadata?.full_name, metadata?.name, metadata?.username]
    .filter((value): value is string => typeof value === "string" && !value.includes("@"))
    .map(value => value.trim().split(/\s+/)[0])
    .find(value => value.length <= 50 && /^\p{L}[\p{L}\p{M}]*(?:['’\-][\p{L}\p{M}]+)*$/u.test(value));
  const emailName = user.email?.split("@")[0]
    .replace(/[._+\-]+/g, " ").replace(/\d+/g, " ").trim().split(/\s+/)[0];
  const readableEmailName = emailName && emailName.length <= 50 && /^\p{L}[\p{L}\p{M}]*$/u.test(emailName)
    ? emailName.charAt(0).toLocaleUpperCase() + emailName.slice(1) : "";
  const displayName = firstName || readableEmailName;

  return (
    <main className="member-screen">
      <section className="member-card" aria-labelledby="member-title">
        <Link href="/" className="binexa-auth-brand" aria-label="Binexa Connect home">
          <Image src="/branding/binexa-icon.png" alt="" width={48} height={48} />
          <div><strong>Binexa<span>Connect</span></strong><small>YOUR WELLNESS COMMUNITY</small></div>
        </Link>
        <p className="binexa-auth-eyebrow">YOUR ACCOUNT</p>
        <h1 id="member-title">{displayName ? `Welcome, ${displayName}!` : "Welcome to Binexa Connect!"}</h1>
        <p className="binexa-auth-description">We&apos;re glad you&apos;re here! Explore wellness resources, discover new ideas, and connect with a community focused on healthier living.</p>
        <div className="member-actions">
          <Link href="/community" className="btn gold">Continue Exploring Binexa Connect →</Link>
        </div>
        <div className="member-signout"><SignOutButton /></div>
        <p className="binexa-auth-footer">Community content is educational and is not medical advice.</p>
      </section>
    </main>
  );
}
