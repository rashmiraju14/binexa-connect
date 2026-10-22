import { safeNextPath } from "@/lib/auth/navigation";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireDiscordMembership } from "@/lib/discord/server";
import AccessGrantedDialog from "./access-granted-dialog";
import "../onboarding.css";

export default async function AccessGrantedPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeNextPath((await searchParams).next);
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/sign-in");
  await requireDiscordMembership(user.id, next);

  return (
    <main className="onboarding-screen">
      <section className="onboarding-card onboarding-success">
        <Image src="/branding/binexa-icon.png" alt="BinexaHealth" width={72} height={72} />
        <p className="onboarding-eyebrow">MEMBERSHIP VERIFIED</p>
        <h1>Welcome to Binexa Connect</h1>
        <p className="onboarding-description">Your community is ready for you.</p>
        <Link href={next} className="onboarding-button onboarding-button-gold">Continue to the community →</Link>
      </section>
      <AccessGrantedDialog next={next} />
    </main>
  );
}
