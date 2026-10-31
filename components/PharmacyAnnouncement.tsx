import { ArrowUpRight } from "lucide-react";
import { discordJoinUrl } from "@/lib/discord/navigation";

export default function PharmacyAnnouncement() {
  return (
    <section className="pharmacy-marquee" aria-label="BinexaHealth Online Pharmacy coming soon">
      <span className="pharmacy-marquee-label">Coming soon</span>
      <p className="pharmacy-announcement-text"><strong>BinexaHealth Online Pharmacy</strong><span>Personalized care, coming your way.</span></p>
      <a className="pharmacy-announcement-link" href={discordJoinUrl} target="_blank" rel="noopener noreferrer">Stay connected <ArrowUpRight size={13} aria-hidden="true" /></a>
    </section>
  );
}
