export const metadata = { alternates: { canonical: "/offerings" } };

import { requireAccount } from "@/lib/auth/require-account";
import PageHeader from "@/components/PageHeader";
import LearningLibrary from "@/components/LearningLibrary";
import CommunityInvitation from "@/components/CommunityInvitation";
import { learningPaths } from "@/lib/learning";
export default async function Offerings() { await requireAccount("/offerings");
  return <main><PageHeader eyebrow="Explore your interests" title="Your wellness learning pathways" subtitle="Weight health, healthy aging, men’s sexual health, and the technology shaping healthcare."/>
    <div className="shell pagecontent"><nav className="learning-topics" aria-label="Health topics">{learningPaths.map(path => <a href={`#${path.id}`} key={path.id}>{path.topic}</a>)}</nav>
      {learningPaths.map(path => <section className="topic-path" id={path.id} key={path.id}><h2>{path.topic}</h2><p>{path.intro}</p><h3>Questions to explore</h3><ul>{path.questions.map(question => <li key={question}>{question}</li>)}</ul><LearningLibrary title="Read, watch, and discover" topic={path.topic}/></section>)}
      <CommunityInvitation/>
    </div></main>;
}
