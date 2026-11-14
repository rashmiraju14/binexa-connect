import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import HomeSignInButton from "@/components/HomeSignInButton";
import CommunityMemberCount from "@/components/CommunityMemberCount";
import { discordJoinUrl } from "@/lib/discord/navigation";
import styles from "./ComingSoonBanner.module.css";

export default function ComingSoonBanner() {
  return <div className={`shell ${styles.wrap}`}>
    <section className={styles.banner} aria-labelledby="pharmacy-feature-title">
      <div className={styles.left}>
        <div className={styles.label}>
          <Image src="/branding/binexa-icon.png" alt="Binexa B logo" width={56} height={56} />
          <span>COMING SOON</span>
        </div>
        <h2 id="pharmacy-feature-title">BinexaHealth Online Pharmacy</h2>
        <p>Personalized online care is on the horizon. Explore wellness resources while we prepare for launch.</p>
        <Link className={styles.ahead} href="/events">See what&apos;s ahead <ArrowRight size={22} aria-hidden="true" /></Link>
      </div>
      <div className={styles.right}>
        <h3>Stay curious. Stay connected.</h3>
        <p>Sign in for new articles, research insights, and community updates. Public resources remain free to explore.</p>
        <div className={`actions home-account-actions ${styles.actions}`}>
          <HomeSignInButton />
          <a className="btn ghost" href={discordJoinUrl} target="_blank" rel="noopener noreferrer">Join Discord</a>
        </div>
        <CommunityMemberCount />
      </div>
    </section>
  </div>;
}
