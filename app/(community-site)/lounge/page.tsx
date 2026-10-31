import WellnessMethods from "@/components/WellnessMethods";
export const metadata = { alternates: { canonical: "/lounge" } };

import { requireAccount } from "@/lib/auth/require-account";
import PageHeader from "@/components/PageHeader";
import LoungeVideos from "@/components/LoungeVideos";
import CommunityInvitation from "@/components/CommunityInvitation";
export default async function Lounge() { await requireAccount("/lounge");return <main><PageHeader eyebrow="The community lounge" title="Watch. Learn. Connect." subtitle="Explore health and wellness videos by topic, discover practical ideas, and make room for a lighter moment."/><div className="shell pagecontent"><LoungeVideos/><WellnessMethods/><section className="research-updates"><h3>An easy icebreaker</h3><p>What is the funniest harmless misunderstanding you’ve had while learning something new? Keep stories anonymous and leave patient or personal medical details out.</p><a className="textlink" href="/discussions">Find your next conversation →</a></section><CommunityInvitation/></div></main>;}
