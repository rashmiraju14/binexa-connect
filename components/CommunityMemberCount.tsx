"use client";

import { useEffect, useState } from "react";
import { Users, MessageCircle } from "lucide-react";
import "./community-member-count.css";

type Stats = { binexaMembers: number | null; discordMembers: number | null };

export default function CommunityMemberCount() {
  const [stats, setStats] = useState<Stats | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch("/api/community/stats", { cache: "no-store", signal: controller.signal });
        if (!response.ok) { setStats(null); return; }
        const data = await response.json();
        if (!controller.signal.aborted && (data.binexaMembers === null || typeof data.binexaMembers === "number") &&
          (data.discordMembers === null || typeof data.discordMembers === "number")) setStats(data);
      } catch {
        if (!controller.signal.aborted) setStats(null);
      }
    }
    void load();
    const interval = setInterval(load, 60000);
    return () => { controller.abort(); clearInterval(interval); };
  }, []);
  return (
    <div className="community-counts" aria-label="Community membership">
      <div className="community-count-badge">
        <span className="community-count-icon"><Users size={16} aria-hidden="true" /></span>
        <span><strong>{stats?.binexaMembers != null ? stats.binexaMembers.toLocaleString() : "—"}</strong> Binexa members</span>
      </div>
      <div className="community-count-badge" title="Approximate Discord server membership">
        <span className="community-count-icon"><MessageCircle size={16} aria-hidden="true" /></span>
        <span><strong>{stats?.discordMembers != null ? stats.discordMembers.toLocaleString() : "—"}</strong> on Discord <small>(approx.)</small></span>
      </div>
    </div>
  );
}
