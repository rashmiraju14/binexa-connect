"use client";

import { useState } from "react";
import { ArrowUpRight, Pause, Play, Sparkles } from "lucide-react";
import { discordJoinUrl } from "@/lib/discord/navigation";

export default function PharmacyAnnouncement() {
  const [paused, setPaused] = useState(false);
  return (
    <section className="pharmacy-marquee" aria-label="BinexaHealth Online Pharmacy coming soon" data-paused={paused}>
      <span className="pharmacy-marquee-label"><Sparkles size={14} aria-hidden="true" /> Coming soon</span>
      <div className="pharmacy-marquee-window">
        <div className="pharmacy-marquee-track">
          {[0, 1].map(copy => <div className="pharmacy-marquee-message" key={copy} aria-hidden={copy === 1 ? true : undefined}>
            <strong>BinexaHealth Online Pharmacy</strong><span className="pharmacy-marquee-dot" aria-hidden="true">✦</span><span>Personalized online care is on the horizon</span><span className="pharmacy-marquee-dot" aria-hidden="true">✦</span><span>Stay connected for launch updates</span><span className="pharmacy-marquee-dot" aria-hidden="true">✦</span>
          </div>)}
        </div>
      </div>
      <div className="pharmacy-marquee-controls">
        <button type="button" className="pharmacy-marquee-pause" onClick={() => setPaused(!paused)} aria-label={paused ? "Play announcement" : "Pause announcement"} aria-pressed={paused}>{paused ? <Play size={13} aria-hidden="true" /> : <Pause size={13} aria-hidden="true" />}</button>
        <a href={discordJoinUrl} target="_blank" rel="noopener noreferrer">Join community <ArrowUpRight size={15} aria-hidden="true" /></a>
      </div>
    </section>
  );
}
