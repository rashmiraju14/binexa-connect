"use client";

import { useEffect, useState } from "react";

type Stats = { binexaMembers: number; discordMembers: number | null };

export default function CommunityMemberCount() {
  const [stats, setStats] = useState<Stats | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch("/api/community/stats", { cache: "no-store", signal: controller.signal });
        if (!response.ok) { setStats(null); return; }
        const data = await response.json();
        if (!controller.signal.aborted && typeof data.binexaMembers === "number" &&
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
    <div style={{ marginBlock: 20 }}>
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", fontWeight: 700 }}>
        <span>Binexa Connect: {stats ? stats.binexaMembers.toLocaleString() : "—"} verified accounts</span>
        <span>Discord: {stats?.discordMembers != null ? `~${stats.discordMembers.toLocaleString()}` : "—"} members</span>
      </div>
      <small>Discord counts are approximate. Verified accounts may include members who have since left Discord.</small>
    </div>
  );
}
