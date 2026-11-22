export const metadata = { alternates: { canonical: "/discussions" } };

import { requireAccount } from "@/lib/auth/require-account";
import DiscussionBoard from "@/components/DiscussionBoard";

export default async function Discussions() {
  await requireAccount("/discussions");
  return <main className="discussion-page">
    <div className="shell discussion-page-heading"><span className="eyebrow">The community corner</span><h1>Community Discussion Board</h1><p>A members-only space to ask questions, share perspectives, and learn together.</p></div>
    <div className="discussion-board-shell"><DiscussionBoard/></div>
  </main>;
}
