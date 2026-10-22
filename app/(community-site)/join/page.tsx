import { requireAccount } from "@/lib/auth/require-account";
import { communityCopy } from "@/lib/communityCopy";
import CommunityOnboarding from "@/components/CommunityOnboarding";
import PageHeader from "@/components/PageHeader";
import LearningLibrary from "@/components/LearningLibrary";
import { discordJoinUrl } from "@/lib/discord/navigation";
export default async function Join() { await requireAccount("/join");
  return <main><PageHeader eyebrow="Learn together" title={communityCopy.join.title} subtitle={communityCopy.join.body}/>
    <div className="shell pagecontent"><div className="cardgrid">
      <article className="card"><span className="pill">Discover</span><h3>Find your next useful read</h3><p>Explore public research, clinician perspectives, and accessible guides across our wellness topics.</p></article>
      <article className="card"><span className="pill">Connect</span><h3>Share what sparks your curiosity</h3><p>Bring an article, a question, or a new perspective to our Discord community.</p></article>
      <article className="card"><span className="pill">Participate</span><h3>Help shape future sessions</h3><p>Suggest topics for community learning and discussions. Event dates will be announced when confirmed.</p></article>
    </div><section className="cta learning-invitation"><div><h2>Start with a hello.</h2><p>Follow the invite to Discord, read the community rules, and introduce your interests. Keep personal medical details private.</p></div><a className="btn gold" href={discordJoinUrl}>{communityCopy.join.cta} →</a></section>
    <CommunityOnboarding/><LearningLibrary title="A taste of what you can explore" ids={["kahan","kumar","ziegelmann"]}/>
    </div></main>;
}
