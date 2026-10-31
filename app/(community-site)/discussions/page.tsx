export const metadata = { alternates: { canonical: "/discussions" } };

import { requireAccount } from "@/lib/auth/require-account";
import DiscussionBoard from "@/components/DiscussionBoard";

export default async function Discussions() { await requireAccount("/discussions");
  return <main className="discussion-page">
    <div className="shell discussion-page-heading"><span className="eyebrow">The community corner</span><h1>A little curiosity.<br/><em>A lot to talk about.</em></h1><p>Find your topic, explore a new perspective, and make a connection.</p></div>
    <div className="discussion-board-shell"><DiscussionBoard/></div>
  </main>;
}
