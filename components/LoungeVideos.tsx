"use client";

import { useState } from "react";
import Link from "next/link";
import PrivacyVideo from "@/components/PrivacyVideo";
import { loungeVideos } from "@/lib/lounge";

const topics = ["All topics", "Weight health", "Healthy aging", "Men’s health", "Nutrition", "Healthy bowls & cooking", "Movement & heart health", "Sleep & stress", "Yoga & Pilates", "Exercise routines", "Breathing & mindfulness", "Laughter & connection"];
const healthTopics = new Set(topics.slice(1, -1));

export default function LoungeVideos({ compact = false }: { compact?: boolean }) {
  const [topic, setTopic] = useState("All topics");
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(12);
  const matches = loungeVideos.filter(video => {
    const category = healthTopics.has(video.type) ? video.type : "Laughter & connection";
    return (topic === "All topics" || topic === category) && `${video.title} ${video.description} ${video.creator} ${category}`.toLowerCase().includes(query.trim().toLowerCase());
  });
  const videos = compact ? loungeVideos.filter(video => healthTopics.has(video.type)).slice(0, 3) : matches.slice(0, limit);
  return <section className="learning-section" aria-labelledby={compact ? "lounge-preview-title" : "lounge-library-title"}>
    <div className="learning-heading"><h2 id={compact ? "lounge-preview-title" : "lounge-library-title"}>{compact ? "Watch, learn, and connect" : "Your health & wellness video library"}</h2><p>Explore weight health, healthy aging, men’s health, nutrition, healthy bowls and cooking, exercise, yoga, breathing, sleep, and stress. Educational content from the original publishers; not personal medical advice. Some videos reflect guidance at their publication date.</p></div>
    {!compact && topic === "Healthy bowls & cooking" && <p className="note">Meal inspiration from university and clinical cooking programs. Check ingredients for allergies and adapt recipes to your dietary needs. These recipes are not individualized meal plans.</p>}
    {!compact && <p className="note">Choose a routine suited to your ability. If you have a health condition, injury, are pregnant, or are unsure whether a routine is suitable, ask a qualified healthcare professional first. Stop if you feel pain or become unwell.</p>}
    {!compact && <div className="lounge-controls">
      <label htmlFor="lounge-search">Find a video</label>
      <input id="lounge-search" type="search" placeholder="Search topics, titles, or publishers" value={query} onChange={event => { setQuery(event.target.value); setLimit(12); }} />
      <div className="lounge-topic-filters" role="group" aria-label="Filter videos by topic">{topics.map(value => <button type="button" key={value} aria-pressed={topic === value} onClick={() => { setTopic(value); setLimit(12); }}>{value}</button>)}</div>
      <p role="status">{matches.length} {matches.length === 1 ? "video" : "videos"} found</p>
    </div>}
    <div className="learning-grid">{videos.map(video => <article className="learning-card" key={video.id}>
      {video.videoId ? <PrivacyVideo key={video.videoId} id={video.videoId} title={`${video.title} by ${video.creator}`} /> : <a className="learning-video-link" href={video.url} target="_blank" rel="noopener noreferrer"><span aria-hidden="true">▶</span><span>Watch on {video.creator} ↗</span></a>}
      <div className="learning-card-body"><span className="pill">{video.type}</span>{video.format && <span className="postmeta">{video.format}</span>}<h3>{video.title}</h3><p>{video.description}</p><div className="postmeta">{video.creator}</div><a className="textlink" href={video.url} target="_blank" rel="noopener noreferrer">Watch at the original source ↗</a></div>
    </article>)}</div>
    {!compact && matches.length === 0 && <div className="note"><p>No videos match this search. Try another term or choose All topics.</p><button type="button" className="btn ghost" onClick={() => { setQuery(""); setTopic("All topics"); setLimit(12); }}>Clear filters</button></div>}
    {!compact && matches.length > limit && <button type="button" className="btn ghost lounge-more" onClick={() => setLimit(value => value + 12)}>Show more videos ({matches.length - limit} remaining)</button>}
    {compact && <Link href="/lounge" className="textlink">Browse all {loungeVideos.length} lounge videos →</Link>}
  </section>;
}
