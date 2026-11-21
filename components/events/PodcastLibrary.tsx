"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, CalendarDays, Clock3, Headphones, Play, Search, SlidersHorizontal, X } from "lucide-react";
import { audioDate, audioDuration, type AudioEpisode } from "@/lib/events-podcasts";
import { discoveryItems, discoveryShows, discoveryTopics, findDiscoveryItems } from "@/lib/podcast-discovery";
import { recommendedDisclaimer } from "@/lib/recommended-podcasts";
import PodcastCover from "./PodcastCover";
import styles from "./PodcastLibrary.module.css";

export default function PodcastLibrary() {
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState("All topics");
  const [showId, setShowId] = useState("all");
  const [order, setOrder] = useState("newest");
  const [limit, setLimit] = useState(12);
  const [active, setActive] = useState<AudioEpisode | null>(null);
  const [playbackError, setPlaybackError] = useState(false);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const audio = useRef<HTMLAudioElement>(null);
  const results = useMemo(() => findDiscoveryItems(query, topic, showId, order), [query, topic, showId, order]);
  const selectedShow = discoveryShows.find(show => show.id === active?.showId);
  const episodeCount = discoveryItems.filter(item => item.kind !== "show").length;
  const resultEpisodes = results.filter(item => item.kind !== "show").length;
  const resultShows = results.length - resultEpisodes;
  function reset() { setQuery(""); setTopic("All topics"); setShowId("all"); setLimit(12); }
  function listen(episode: AudioEpisode) {
    setPlaybackError(false);
    setActiveVideo(null);
    if (active?.id === episode.id) { audio.current?.play().catch(() => setPlaybackError(true)); }
    else setActive(episode);
  }

  function watch(id: string) { audio.current?.pause(); setActive(null); setActiveVideo(selected => selected === id ? null : id); }

  return <main className={`${styles.page} ${active ? styles.hasPlayer : ""}`}>
    <div className={`shell ${styles.breadcrumb}`}><Link href="/events"><ArrowLeft size={15} aria-hidden="true" />Back to Events</Link><span>/</span><span>Podcast Library</span></div>
    <section className={`shell ${styles.hero}`} aria-labelledby="audio-library-title"><div className={styles.heroCopy}><span className={styles.eyebrow}>HEALTHCARE PODCAST LIBRARY</span><h1 id="audio-library-title">A little listening.<br />A new perspective.</h1><p>Find a conversation that speaks to your curiosity. Explore healthcare, wellness, and medical innovation from established publishers.</p><div className={styles.stats}><span><Headphones size={17} aria-hidden="true" />{episodeCount} episodes</span><span>{discoveryShows.length} podcast series</span><span>Public listening</span></div></div><div className={styles.heroPhoto}><Image src="/images/events/podcast-topic.webp" alt="A microphone, notebook, and headphones ready for a listening session" width={1000} height={700} sizes="(max-width: 700px) 100vw, 40vw" unoptimized priority /></div></section>

    <section className={`shell ${styles.library}`} aria-labelledby="browse-heading">
      <div className={styles.heading}><div><span className={styles.eyebrow}>FOLLOW YOUR INTERESTS</span><h2 id="browse-heading">What would you like to hear?</h2></div><p>Independent publisher podcasts.<br />Gold cards are community picks.</p></div>
      <div className={styles.topics} role="group" aria-label="Filter podcasts by topic">{discoveryTopics.map(label => <button key={label} type="button" aria-pressed={topic === label} onClick={() => { setTopic(label); setLimit(12); }}>{label}</button>)}</div>
      <div className={styles.toolbar}>
        <div className={styles.search}><Search size={18} aria-hidden="true" /><label className={styles.srOnly} htmlFor="podcast-search">Search podcasts</label><input id="podcast-search" type="search" placeholder="Search episodes, topics, or publishers" value={query} onChange={event => { setQuery(event.target.value); setLimit(12); }} /></div>
        <div className={styles.select}><label htmlFor="podcast-series">Podcast series</label><select id="podcast-series" value={showId} onChange={event => { setShowId(event.target.value); setLimit(12); }}><option value="all">All series</option>{discoveryShows.map(show => <option key={show.id} value={show.id}>{show.title}</option>)}</select></div>
        <div className={styles.select}><label htmlFor="podcast-order">Sort by</label><select id="podcast-order" value={order} onChange={event => setOrder(event.target.value)}><option value="newest">Newest first</option><option value="shortest">Shortest first</option></select></div>
      </div>
      <div className={styles.resultBar}><p role="status">{results.length} results · {resultEpisodes} {resultEpisodes === 1 ? "episode" : "episodes"}{resultShows ? ` · ${resultShows} ${resultShows === 1 ? "show" : "shows"}` : ""}</p>{(query || topic !== "All topics" || showId !== "all") && <button type="button" onClick={reset}><X size={14} aria-hidden="true" />Clear filters</button>}</div>
      <div className={styles.grid}>{results.slice(0, limit).map(item => {
        const selected = item.audioEpisode?.id === active?.id && Boolean(active);
        const image = <><PodcastCover title={item.title} category={item.category} /><span className={styles.playOverlay}><Play size={17} fill="currentColor" aria-hidden="true" /></span>{item.durationSeconds && <span className={styles.duration}>{audioDuration(item.durationSeconds)}</span>}</>;
        return <article className={`${styles.card} ${selected ? styles.selected : ""} ${item.recommended ? styles.recommended : ""}`} key={item.id} data-discovery-id={item.id} data-community-pick={item.recommended ? "true" : undefined}>
          {item.audioEpisode ? <button type="button" className={styles.thumbnail} aria-label={`Play audio: ${item.title}`} onClick={() => listen(item.audioEpisode!)}>{image}</button> : item.videoId ? <button type="button" className={styles.thumbnail} aria-label={`Watch ${item.title}`} onClick={() => watch(item.id)}>{image}</button> : <a className={styles.thumbnail} href={item.sourceUrl} target="_blank" rel="noopener noreferrer" aria-label={`Listen to ${item.title}`}>{image}</a>}
          <div className={styles.cardBody}>
            <div className={styles.byline}><span title={item.publisher}>{item.publisher}</span>{item.recommended && <strong>Community pick</strong>}</div>
            <p className={styles.series} title={item.seriesTitle}>{item.seriesTitle}</p>
            <span className={styles.topic}>{item.category}</span>
            <h3 className={styles.cardTitle} title={item.title}>{item.title}</h3>
            <p className={styles.summary} title={item.description}>{item.description}</p>
            <details className={styles.details}><summary>Full details</summary><p><strong>{item.title}</strong></p><p>{item.description}</p>{item.kind === "show" && item.audioEpisode && <p>Listen to: {item.audioEpisode.title}</p>}{item.accessNote && <p>{item.accessNote}</p>}</details>
            <div className={styles.metadata}>{item.published && <span><CalendarDays size={13} aria-hidden="true" /><time dateTime={item.published}>{audioDate(item.published)}</time></span>}{item.durationSeconds !== null && <span><Clock3 size={13} aria-hidden="true" />{audioDuration(item.durationSeconds)}</span>}{!item.published && <span>{item.kind === "show" ? "Podcast series" : "Publisher episode"}</span>}</div>
            <div className={styles.cardActions}>{item.audioEpisode ? <button type="button" className={styles.listen} aria-pressed={selected} aria-label={`Listen to ${item.title}`} onClick={() => listen(item.audioEpisode!)}><Play size={15} aria-hidden="true" />{selected ? "Selected episode" : "Listen"}</button> : item.videoId ? <button type="button" className={styles.listen} aria-expanded={activeVideo === item.id} onClick={() => watch(item.id)}><Play size={15} aria-hidden="true" />Watch</button> : <a className={styles.listen} href={item.sourceUrl} target="_blank" rel="noopener noreferrer"><Play size={15} aria-hidden="true" />Listen</a>}<a href={item.sourceUrl} target="_blank" rel="noopener noreferrer">Publisher<ArrowUpRight size={14} aria-hidden="true" /></a></div>
            {item.videoId && activeVideo === item.id && <div className={styles.embeddedVideo}><iframe src={`https://www.youtube-nocookie.com/embed/${item.videoId}`} title={item.title} loading="lazy" allow="encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /><button type="button" onClick={() => setActiveVideo(null)}><X size={14} aria-hidden="true" />Close video</button></div>}
            {item.youtubeUrl && <a className={styles.youtubeLink} href={item.youtubeUrl} target="_blank" rel="noopener noreferrer">Watch on YouTube<ArrowUpRight size={13} aria-hidden="true" /></a>}
          </div>
        </article>;
      })}</div>
      {!results.length && <div className={styles.empty}><SlidersHorizontal size={28} aria-hidden="true" /><h3>No podcasts found</h3><p>Try another topic, series, or search term.</p><button type="button" className={styles.listen} onClick={reset}>Show all podcasts</button></div>}
      {results.length > limit && <div className={styles.loadMore}><button type="button" onClick={() => setLimit(value => value + 12)}>Show more podcasts</button><small>Showing {Math.min(limit, results.length)} of {results.length}</small></div>}
      <p className={styles.disclaimer}>{recommendedDisclaimer}</p>
      <p className={styles.sourceNote}>Episode details checked November 21, 2026. Binexa Connect library covers identify our curated collection; the podcasts are independently produced. Audio streams from the publisher when you choose an episode.</p>
    </section>

    {active && <section className={styles.player} aria-label="Podcast audio player"><div className={styles.playerInfo}><span><Headphones size={15} aria-hidden="true" />{selectedShow?.title}</span><h2>{active.title}</h2><a href={active.sourceUrl} target="_blank" rel="noopener noreferrer">Open publisher page<ArrowUpRight size={12} aria-hidden="true" /></a></div><div className={styles.audioControls}><audio ref={audio} key={active.id} src={active.audioUrl} controls autoPlay preload="none" onError={() => setPlaybackError(true)} aria-label={`Audio: ${active.title}`} />{playbackError && <p role="status">Unable to play this stream. Try the publisher page.</p>}</div><button type="button" className={styles.close} aria-label="Close audio player" onClick={() => { audio.current?.pause(); setActive(null); setPlaybackError(false); }}><X size={19} aria-hidden="true" /></button></section>}
  </main>;
}
