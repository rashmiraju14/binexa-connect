import { communityCopy } from "@/lib/communityCopy";
import { communityUrl } from "@/lib/learning";
export default function CommunityInvitation() {
  return <section className="cta learning-invitation"><div><h2>{communityCopy.join.title}</h2><p>{communityCopy.join.body}</p></div><a className="btn gold" href={communityUrl} target="_blank" rel="noopener noreferrer">{communityCopy.join.cta} →</a></section>;
}
