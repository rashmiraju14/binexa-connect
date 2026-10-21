import DiscussionBoard from "@/components/DiscussionBoard";
import LearningLibrary from "@/components/LearningLibrary";

export default function Discussions() {
  return <main className="discussion-page">
    <div className="shell discussion-page-heading"><span className="eyebrow">The community corner</span><h1>A little curiosity.<br/><em>A lot to talk about.</em></h1><p>Find your topic, explore a new perspective, and make a connection.</p></div>
    <div className="discussion-board-shell"><DiscussionBoard/></div>
    <div className="shell learning-page-bottom"><LearningLibrary title="Something worth talking about" subtitle="Bring a useful read and a thoughtful question to the conversation." ids={["glp-research", "brennan", "digital-health"]}/></div>
  </main>;
}
