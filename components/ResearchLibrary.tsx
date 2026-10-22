"use client";
import { useState } from "react";
import { researchResources } from "@/lib/research-library";
const topics = ["All topics", ...new Set(researchResources.map(item => item.topic))];
export default function ResearchLibrary() {
  const [topic, setTopic] = useState("All topics");
  const [query, setQuery] = useState("");
  const items = researchResources.filter(item => (topic === "All topics" || item.topic === topic) && `${item.title} ${item.topic} ${item.publisher} ${item.summary}`.toLowerCase().includes(query.trim().toLowerCase()));
  return <section id="research-library" className="learning-section" aria-labelledby="research-library-title">
    <details className="research-reading-guide"><summary><strong>How to read a health study</strong></summary><ol><li>Identify the study type: a trial, an observational study, a review, or laboratory research.</li><li>Check who participated, how many people were included, and what comparison was used.</li><li>Look at the size of the benefit and possible harms, not just the headline.</li><li>Check limitations, funding, publication date, and whether other studies agree.</li><li>Discuss personal treatment decisions with a qualified healthcare professional.</li></ol></details>
    <div className="learning-heading"><h2 id="research-library-title">Go deeper: articles, research &amp; practical guides</h2><p>Explore original health sources with short editorial summaries and questions to guide your reading. Sources selected October 22, 2026; visit each publisher for updates. These summaries have not received clinical review.</p></div>
    <div className="lounge-controls"><label htmlFor="research-search">Search the reading library</label><input id="research-search" type="search" value={query} placeholder="Search articles, topics, or publishers" onChange={event => setQuery(event.target.value)} /><div className="lounge-topic-filters" role="group" aria-label="Filter reading by topic">{topics.map(value => <button key={value} type="button" aria-pressed={topic === value} onClick={() => setTopic(value)}>{value}</button>)}</div><p role="status">{items.length} resources found</p></div>
    <div className="learning-grid">{items.map(item => <article className="learning-card" key={item.url}><div className="learning-card-body"><span className="pill">{item.topic} · {item.format}</span><h3>{item.title}</h3><p>{item.summary}</p><p className="research-question"><strong>Ask as you read:</strong> {item.question}</p><div className="postmeta">{item.publisher}</div><a className="textlink" href={item.url} target="_blank" rel="noopener noreferrer">{item.format === "Research hub" ? "Explore research" : "Read the full source"} ↗</a></div></article>)}</div>
    {items.length === 0 && <p className="note">No matching resources. Try a different search or choose All topics.</p>}

  </section>;
}
