import { ArrowUpRight, PlayCircle } from "lucide-react";
import { learningItems, type LearningTopic, type LearningItem } from "@/lib/learning";
export default function LearningLibrary({ title, subtitle, topic, kind, ids }: {
  title: string; subtitle?: string; topic?: LearningTopic; kind?: LearningItem["kind"]; ids?: string[];
}) {
  const items = learningItems.filter(item => (!topic || item.topic === topic) && (!kind || item.kind === kind) && (!ids || ids.includes(item.id)));
  return <section className="learning-section">
    <div className="learning-heading"><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>
    <div className="learning-grid">{items.map(item => <article className="learning-card" key={item.id}>
      {item.videoId && <iframe className="learning-video" src={`https://www.youtube-nocookie.com/embed/${item.videoId}`} title={item.title} loading="lazy" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />}
      {item.kind === "Video" && !item.videoId && <a className="learning-video-link" href={item.url} target="_blank" rel="noopener noreferrer"><PlayCircle size={42}/><span>Watch on {item.publisher}</span></a>}
      <div className="learning-card-body"><span className="pill">{item.topic} · {item.kind}</span><h3>{item.title}</h3><p>{item.description}</p>
        <div className="postmeta">{item.publisher}{item.expert && <><br/>{item.expert}</>}{item.date && <><br/>{item.date}</>}</div>
        <a className="textlink" href={item.url} target="_blank" rel="noopener noreferrer">{item.kind === "Video" ? "Video and transcript" : "Read original source"} <ArrowUpRight size={15}/></a>
      </div>
    </article>)}</div>
  </section>;
}
