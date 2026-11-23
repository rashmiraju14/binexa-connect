"use client";

import { useState } from "react";
import { Pause, Play, Sparkles } from "lucide-react";

export default function PharmacyAnnouncement() {
  const [paused, setPaused] = useState(false);
  return (
    <section className="pharmacy-marquee" aria-label="BinexaHealth launch and first-time customer promo" data-paused={paused}>
      <span className="pharmacy-marquee-label"><Sparkles size={14} aria-hidden="true" /> Launch · November 23</span>
      <div className="pharmacy-marquee-window">
        <div className="pharmacy-marquee-track">
          {[0, 1].map(copy => <div className="pharmacy-marquee-message" key={copy} aria-hidden={copy === 1 ? true : undefined}>
            <strong>BinexaHealth Online Pharmacy</strong><span className="pharmacy-marquee-dot" aria-hidden="true">✦</span><span>Launching November 23, 2026</span><span className="pharmacy-marquee-dot" aria-hidden="true">✦</span><span>First-time customers: use promo code WELCOME50</span><span className="pharmacy-marquee-dot" aria-hidden="true">✦</span>
            <span>New articles and research insights — Sign in to stay connected!</span><span className="pharmacy-marquee-dot" aria-hidden="true">✦</span>
          </div>)}
        </div>
      </div>
      <div className="pharmacy-marquee-controls">
        <button type="button" className="pharmacy-marquee-pause" data-auth-trigger onClick={() => setPaused(!paused)} aria-label={paused ? "Play announcement" : "Pause announcement"} aria-pressed={paused}>{paused ? <Play size={13} aria-hidden="true" /> : <Pause size={13} aria-hidden="true" />}</button>
      </div>
    </section>
  );
}
