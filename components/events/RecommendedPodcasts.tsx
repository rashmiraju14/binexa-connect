"use client";

import { useState } from "react";
import { ArrowUpRight, Headphones, Play, Youtube, X } from "lucide-react";
import { filterRecommendedEpisodes, filterRecommendedPodcasts, recommendedCategories, recommendedDisclaimer, recommendedPodcasts, type RecommendedCategory } from "@/lib/recommended-podcasts";
import styles from "./RecommendedPodcasts.module.css";

export default function RecommendedPodcasts() {
  const [category, setCategory] = useState<RecommendedCategory>("All Podcasts");
  const [video, setVideo] = useState<string | null>(null);
  const podcasts = filterRecommendedPodcasts(category);
  const episodes = filterRecommendedEpisodes(category);
  return <section className={`shell ${styles.section}`} id="wellness-listening-room" aria-labelledby="listening-room-title">
    <div className={styles.heading}><div><span className={styles.eyebrow}>CURATED FOR OUR COMMUNITY</span><h2 id="listening-room-title">The Wellness Listening Room</h2><p>Discover expert conversations, medical research, and fresh perspectives on healthier living.</p></div><span className={styles.externalLabel}><Headphones size={17} aria-hidden="true" />Independent podcasts</span></div>
    <div className={styles.filters} role="group" aria-label="Filter recommended podcasts by category">{recommendedCategories.map(label => <button type="button" key={label} aria-pressed={category === label} onClick={() => { setCategory(label); setVideo(null); }}>{label}</button>)}</div>
    <p className={styles.count} role="status">{podcasts.length} {podcasts.length === 1 ? "podcast" : "podcasts"} · {category}</p>
    <div className={styles.grid}>{podcasts.map(podcast => <article key={podcast.id} data-podcast-id={podcast.id} className={styles.card}>
      <div className={`${styles.cover} ${styles[podcast.color]}`} aria-label={`Text cover for ${podcast.name}`}><div className={styles.coverTop}><Headphones size={20} strokeWidth={1.5} aria-hidden="true" /><span>INDEPENDENT PODCAST</span></div><span className={styles.monogram} aria-hidden="true">{podcast.initials}</span><div className={styles.coverBottom}><strong>{podcast.name}</strong><span>{podcast.publisher.split(' · ')[0]}</span></div></div>
      <div className={styles.cardBody}><p className={styles.publisher}>{podcast.publisher}</p><h3>{podcast.name}</h3><p>{podcast.description}</p><div className={styles.categories}>{podcast.categories.map(topic => <span key={topic}>{topic}</span>)}</div>{podcast.accessNote && <small className={styles.accessNote}>{podcast.accessNote}</small>}<div className={styles.actions}><a className={styles.explore} href={podcast.url} target="_blank" rel="noopener noreferrer">Explore Podcast<ArrowUpRight size={15} aria-hidden="true" /></a>{podcast.youtubeUrl && <a className={styles.watch} href={podcast.youtubeUrl} target="_blank" rel="noopener noreferrer"><Youtube size={16} aria-hidden="true" />Watch on YouTube</a>}</div></div>
    </article>)}</div>
    <div className={styles.episodeSection}><div className={styles.episodeHeading}><h3>Recommended Episodes</h3><p>A few conversations to start with, selected around the interests of our community.</p></div><div className={styles.episodeGrid}>{episodes.map(episode => {
      const podcast = recommendedPodcasts.find(podcast => podcast.id === episode.podcastId)!;
      return <article key={episode.id} data-episode-id={episode.id} className={styles.episode}><div className={styles.episodeIcon}><Headphones size={20} aria-hidden="true" /></div><div className={styles.episodeBody}><span className={styles.topic}>{episode.category}</span><h4>{episode.title}</h4><p>{episode.summary}</p><span className={styles.episodePublisher}>{podcast.name} · {podcast.publisher.split(' · ')[0]}</span><div className={styles.episodeActions}><a href={episode.url} target="_blank" rel="noopener noreferrer">Explore Episode<ArrowUpRight size={14} aria-hidden="true" /></a>{episode.youtubeId && <button type="button" aria-expanded={video === episode.id} onClick={() => setVideo(selected => selected === episode.id ? null : episode.id)}><Play size={14} aria-hidden="true" />{video === episode.id ? "Close video" : "Watch here"}</button>}</div>
        {video === episode.id && episode.youtubeId && <div className={styles.embed}><iframe src={`https://www.youtube-nocookie.com/embed/${episode.youtubeId}`} title={episode.title} loading="lazy" allow="encrypted-media; picture-in-picture; fullscreen" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /><button type="button" aria-label="Close embedded episode" onClick={() => setVideo(null)}><X size={14} aria-hidden="true" />Close video</button></div>}</div></article>;
    })}</div></div>
    <p className={styles.disclaimer}>{recommendedDisclaimer}</p>
  </section>;
}
