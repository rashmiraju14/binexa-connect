import { requireAccount } from "@/lib/auth/require-account";
import PageHeader from "@/components/PageHeader";
import LoungeVideos from "@/components/LoungeVideos";
import CommunityInvitation from "@/components/CommunityInvitation";
export default async function Lounge() { await requireAccount("/lounge");return <main><PageHeader eyebrow="The community lounge" title="Come for the curiosity. Stay for the connection." subtitle="Not every conversation needs to be serious. Enjoy a little humor, share a good find, and make room for a lighter moment."/><div className="shell pagecontent"><LoungeVideos/><section className="research-updates"><h3>An easy icebreaker</h3><p>What is the funniest harmless misunderstanding you’ve had while learning something new? Keep stories anonymous and leave patient or personal medical details out.</p><a className="textlink" href="/discussions">Find your next conversation →</a></section><CommunityInvitation/></div></main>;}
