"use client";

import { useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, CalendarDays, Camera, ChevronLeft, ChevronRight, Headphones, Images, MessageCircle, Mic2, Play, Sparkles, Users, X, Youtube } from "lucide-react";
import BackToHome from "@/components/BackToHome";
import { discordJoinUrl } from "@/lib/discord/navigation";
import { displayEventDate, editorialImages, hasVideo, localMediaPath, pastEvents, suggestedTopics, youtube, youtubeDestination, youtubeVideoId, type EventVideo, type GalleryMedia, type PodcastEpisode } from "@/lib/events";
import styles from "./EventsMedia.module.css";

function ExternalButton({ href, children, gold = false }: { href: string; children: ReactNode; gold?: boolean }) {
  return <a className={`${styles.button} ${gold ? styles.gold : styles.outline}`} href={href} target="_blank" rel="noopener noreferrer">{children}<ArrowUpRight size={16} aria-hidden="true" /></a>;
}
function SectionHeading({ label, title, description }: { label: string; title: string; description: string }) {
  return <div className={styles.sectionHeading}><span className={styles.eyebrow}>{label}</span><h2>{title}</h2><p>{description}</p></div>;
}
export function VideoPlayer({ video, title }: { video: EventVideo; title: string }) {
  if (youtubeVideoId(video.youtubeId)) return <iframe className={styles.player} title={title} src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}`} loading="lazy" allow="encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />;
  if (localMediaPath(video.src)) return <video className={styles.player} controls preload="metadata" poster={video.poster} src={video.src} aria-label={title}>Your browser does not support this video.</video>;
  return null;
}
function EpisodeCard({ episode }: { episode: PodcastEpisode }) {
  if (!youtubeVideoId(episode.videoId)) return null;
  return <article className={styles.episodeCard}>
    <a className={styles.episodeImage} href={`https://www.youtube.com/watch?v=${episode.videoId}`} target="_blank" rel="noopener noreferrer" aria-label={`Watch ${episode.title}`}>
      {/* YouTube supplies the thumbnail for each verified configured video ID. */}
      <Image unoptimized src={episode.thumbnail?.src || `https://i.ytimg.com/vi/${episode.videoId}/hqdefault.jpg`} alt={episode.thumbnail?.alt || episode.title} width={640} height={360} sizes="(max-width: 700px) 100vw, 33vw" />
      <span className={styles.play}><Play size={24} aria-hidden="true" /></span>
    </a>
    <div className={styles.cardBody}><h3>{episode.title}</h3><p>{episode.description}</p><p className={styles.metadata}>{episode.published && <time dateTime={episode.published}>{displayEventDate(episode.published)}</time>}{episode.duration && <span>{episode.duration}</span>}</p><ExternalButton href={`https://www.youtube.com/watch?v=${episode.videoId}`}>Watch Episode</ExternalButton></div>
  </article>;
}

export function MediaGallery({ items, title }: { items: GalleryMedia[]; title: string }) {
  const [active, setActive] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const touchStart = useRef<number | null>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const media = items.filter(item => item.kind === "image" ? localMediaPath(item.src) : hasVideo(item.video));
  if (!media.length) return null;
  const selected = media[active % media.length];
  function move(step: number) { setActive(index => (index + step + media.length) % media.length); }
  function close() { dialog.current?.close(); trigger.current?.focus(); }
  return <div className={styles.galleryWrap}>
    <div className={styles.gallery}>
      {(expanded ? media : media.slice(0, 5)).map((item, index) => <button key={item.id} type="button" className={styles.galleryTile} onClick={event => { trigger.current = event.currentTarget; setActive(index); dialog.current?.showModal(); }} aria-label={`Enlarge: ${item.caption}`}>
        {item.kind === "image" && item.src ? <Image unoptimized src={item.src} alt={item.caption} width={900} height={650} sizes="(max-width: 700px) 100vw, 50vw" /> : <span className={styles.videoTile}><Play aria-hidden="true" size={40} /></span>}
        <span className={styles.galleryCaption}>{item.caption}<small>{item.category}{item.date ? ` · ${displayEventDate(item.date)}` : ""}</small></span>
      </button>)}
    </div>
    {!expanded && media.length > 5 && <button type="button" className={`${styles.button} ${styles.outline}`} onClick={() => setExpanded(true)}><Images size={17} aria-hidden="true" />View All Photos ({media.length})</button>}
    <dialog className={styles.lightbox} ref={dialog} aria-label={title} onCancel={event => { event.preventDefault(); close(); }} onClose={() => trigger.current?.focus()} onKeyDown={event => { if (event.key === "ArrowRight") { event.preventDefault(); move(1); } if (event.key === "ArrowLeft") { event.preventDefault(); move(-1); } }} onTouchStart={event => { touchStart.current = event.changedTouches[0].clientX; }} onTouchEnd={event => { if (touchStart.current !== null) { const delta = event.changedTouches[0].clientX - touchStart.current; if (Math.abs(delta) > 50) move(delta < 0 ? 1 : -1); } touchStart.current = null; }}>
      <button type="button" className={styles.close} aria-label="Close gallery" onClick={close} autoFocus><X aria-hidden="true" /></button>
      <div className={styles.lightboxMedia} key={selected.id}>{selected.kind === "image" && selected.src ? <Image unoptimized src={selected.src} alt={selected.caption} width={1600} height={1100} sizes="90vw" /> : selected.video && <VideoPlayer video={selected.video} title={selected.caption} />}</div>
      <div className={styles.lightboxBar}><button type="button" className={styles.iconButton} aria-label="Previous image" onClick={() => move(-1)} disabled={media.length < 2}><ChevronLeft /></button><div aria-live="polite"><p>{selected.caption}</p><small>{selected.category}{selected.date ? ` · ${displayEventDate(selected.date)}` : ""} · {active + 1} / {media.length}</small></div><button type="button" className={styles.iconButton} aria-label="Next image" onClick={() => move(1)} disabled={media.length < 2}><ChevronRight /></button></div>
    </dialog>
  </div>;
}
export default function EventsMedia() {
  const [activeSection, setActiveSection] = useState("podcast");
  const channel = youtubeDestination(youtube.channelUrl);
  const playlist = youtubeDestination(youtube.playlistUrl);
  const subscribe = youtubeDestination(youtube.subscribeUrl);
  const featured = youtube.featuredEpisode && youtubeVideoId(youtube.featuredEpisode.videoId) ? youtube.featuredEpisode : null;
  const episodes = youtube.episodes.filter(episode => youtubeVideoId(episode.videoId) && episode.id !== featured?.id);
  return <main className={styles.page}>
    <div className={`shell ${styles.back}`}><BackToHome /></div>
    <nav className={`shell ${styles.jumpLinks}`} aria-label="Explore Events and Media">
      <a href="#podcast" aria-current={activeSection === "podcast" ? "location" : undefined} onClick={() => setActiveSection("podcast")}><Headphones size={20} aria-hidden="true" /><span>The Podcast</span></a>
      <a href="#youtube-highlights" aria-current={activeSection === "youtube-highlights" ? "location" : undefined} onClick={() => setActiveSection("youtube-highlights")}><Youtube size={20} aria-hidden="true" /><span>YouTube Highlights</span></a>
      <a href="#event-highlights" aria-current={activeSection === "event-highlights" ? "location" : undefined} onClick={() => setActiveSection("event-highlights")}><Camera size={20} aria-hidden="true" /><span>Event Highlights</span></a>
    </nav>
    <section className={`shell ${styles.hero}`} aria-labelledby="events-title">
      <div className={styles.heroCopy}><span className={styles.eyebrow}>CONNECT · LEARN · GROW</span><h1 id="events-title">Bringing wellness<br />conversations <em>to life.</em></h1><p>Explore our podcasts, community events, educational conversations, and memorable moments from Binexa.</p><div className={styles.actions}><a className={`${styles.button} ${styles.heroOutline}`} href="/events/highlights">Explore Event Highlights<ArrowRight size={17} aria-hidden="true" /></a></div><div className={styles.heroNote}><span />A space for curiosity, connection, and wellbeing.</div></div>
      <figure className={styles.heroPhoto}><Image unoptimized src={editorialImages.hero.src} alt={editorialImages.hero.alt} width={1400} height={1000} priority sizes="(max-width: 700px) 100vw, 50vw" /><figcaption><Mic2 size={18} aria-hidden="true" />Good conversations start with a little curiosity.</figcaption></figure>
    </section>


    <section className={`shell ${styles.section}`} id="podcast" aria-labelledby="podcast-heading">
      <div className={styles.sectionHeading}><span className={styles.eyebrow}>THE BINEXA PODCAST</span><h2 id="podcast-heading">Watch. Listen. Learn.</h2><p>Meaningful conversations about healthcare, wellness, innovation, and healthier living.</p></div>
      <div className={styles.featureCard}>
        {featured ? <><VideoPlayer video={{ youtubeId: featured.videoId }} title={featured.title} /><div className={styles.featureCopy}><span className={styles.eyebrow}>LATEST EPISODE</span><h3>{featured.title}</h3><p>{featured.description}</p><p className={styles.metadata}>{featured.published && <time dateTime={featured.published}>{displayEventDate(featured.published)}</time>}{featured.duration && <span>{featured.duration}</span>}</p><ExternalButton href={`https://www.youtube.com/watch?v=${featured.videoId}`} gold><Play size={17} aria-hidden="true" />Watch on YouTube</ExternalButton><Link href="/events/podcasts" className={`${styles.button} ${styles.gold}`}><Headphones size={18} aria-hidden="true" />Listen to Podcasts</Link></div></> : <><div className={styles.studioPhoto}><Image unoptimized src={editorialImages.studio.src} alt={editorialImages.studio.alt} width={1000} height={670} sizes="(max-width: 700px) 100vw, 50vw" /></div><div className={styles.featureCopy}><span className={styles.roundIcon}><Headphones aria-hidden="true" /></span><span className={styles.eyebrow}>A NEW CONVERSATION IS COMING</span><h3>Our podcast episodes<br />are coming soon.</h3><p>Thoughtful voices. Fresh perspectives. A little inspiration for healthier living.</p><p>Have a question you’d like us to explore? Help shape our next conversation.</p><div className={styles.actions}><a className={styles.textLink} href="#suggest-a-topic">Suggest a topic<ArrowRight size={17} aria-hidden="true" /></a><Link href="/events/podcasts" className={`${styles.button} ${styles.gold}`}><Headphones size={18} aria-hidden="true" />Listen to Podcasts</Link></div></div></>}
      </div>
      <div className={styles.actions}>{subscribe && <ExternalButton href={subscribe}>Subscribe on YouTube</ExternalButton>}{playlist && <ExternalButton href={playlist}>Explore All Episodes</ExternalButton>}</div>
      {episodes.length > 0 && <div className={styles.episodes}>{episodes.map(episode => <EpisodeCard episode={episode} key={episode.id} />)}</div>}
    </section>

    <div className={styles.creamBand}><section className={`shell ${styles.section}`} id="event-highlights">
      <SectionHeading label="OUR JOURNEY" title="Moments that bring us together." description="A look back at the beginnings, conversations, and connections that move us forward." />
      {pastEvents.map(event => <div key={event.id}>
        <article className={`${styles.featureCard} ${styles.eventFeature}`}><div className={styles.eventCover}>{event.cover ? <Image unoptimized src={event.cover.src} alt={event.cover.alt} width={1000} height={750} sizes="(max-width: 700px) 100vw, 50vw" /> : <div className={styles.eventPlaceholder}><span className={styles.orbit}><Sparkles size={38} strokeWidth={1} aria-hidden="true" /></span><span className={styles.eyebrow}>THE BEGINNING OF SOMETHING MEANINGFUL</span><strong>One community.<br />A shared vision.</strong><small>Awaiting pre-launch event photos</small></div>}</div><div className={styles.featureCopy}><div className={styles.badges}><span>{event.status}</span><span>{event.category}</span></div><h3>{event.name}</h3><p className={styles.date}><CalendarDays size={18} aria-hidden="true" /><time dateTime={event.date}>{displayEventDate(event.date)}</time></p><p>{event.description}</p><div className={styles.actions}><a href={`/events/highlights#${event.id}`} className={`${styles.button} ${styles.gold}`}>Explore Event Highlights<ArrowRight size={17} aria-hidden="true" /></a>{hasVideo(event.recap) && <a className={`${styles.button} ${styles.outline}`} href={`/events/highlights#${event.id}-recap`}><Play size={16} aria-hidden="true" />Watch Event Recap</a>}</div></div></article>
      </div>)}
    </section></div>

    <section className={`shell ${styles.section}`} id="youtube-highlights">
      <SectionHeading label="BINEXA ON YOUTUBE" title="Binexa YouTube Highlights" description="Watch conversations, community highlights, and new perspectives from Binexa." />
      {featured || episodes.length ? <div className={styles.episodes}>{(featured ? [featured, ...episodes] : episodes).map(episode => <EpisodeCard key={episode.id} episode={episode} />)}</div> : <div className={styles.featureCard}><div className={styles.studioPhoto}><Image unoptimized src={editorialImages.youtubeHighlights.src} alt={editorialImages.youtubeHighlights.alt} width={1400} height={800} sizes="(max-width: 700px) 100vw, 50vw" /></div><div className={styles.featureCopy}><span className={styles.roundIcon}><Youtube aria-hidden="true" /></span><h3>{channel ? <>Watch Binexa<br />on YouTube.</> : <>Our YouTube highlights<br />are coming soon.</>}</h3><p>{channel ? "Explore Binexa’s video conversations and highlights on our YouTube channel." : "A place for Binexa’s video conversations and memorable moments. We’ll share our official videos here when they’re available."}</p><div className={styles.actions}>{channel ? <ExternalButton href={channel} gold><Youtube size={20} aria-hidden="true" />Click Here to Watch</ExternalButton> : <button type="button" className={`${styles.button} ${styles.gold}`} disabled title="YouTube channel coming soon"><Youtube size={20} aria-hidden="true" />Click Here to Watch</button>}</div></div></div>}
      {channel && (featured || episodes.length > 0) && <div className={styles.actions}><ExternalButton href={channel} gold><Youtube size={18} aria-hidden="true" />Click Here to Watch</ExternalButton></div>}
    </section>



    <section className={`shell ${styles.topic}`} id="suggest-a-topic"><div className={styles.topicCopy}><span className={styles.eyebrow}>YOUR VOICE MATTERS</span><h2>What should we<br />talk about next?</h2><p>Have a wellness question, podcast topic, or community event idea? We’d love to hear from you.</p><ul className={styles.topics}>{suggestedTopics.map(topic => <li key={topic}>{topic}</li>)}</ul><ExternalButton href={discordJoinUrl} gold><MessageCircle size={18} aria-hidden="true" />Suggest a Topic</ExternalButton><small className={styles.privacyNote}>Share general ideas in Discord. Please keep personal health information private.</small></div><figure className={styles.topicImage}><Image unoptimized src={editorialImages.topic.src} alt={editorialImages.topic.alt} width={900} height={1000} sizes="(max-width: 700px) 100vw, 45vw" /><figcaption>Every great conversation starts with a question.</figcaption></figure></section>

    <section className={`shell ${styles.connected}`}><span className={styles.eyebrow}>STAY CONNECTED</span><h2>Be part of our journey.</h2><p>Stay connected with Binexa, discover new conversations, and never miss an upcoming community event.</p><div className={styles.actions}>{subscribe && <ExternalButton href={subscribe} gold><Youtube size={18} aria-hidden="true" />Subscribe on YouTube</ExternalButton>}<ExternalButton href={discordJoinUrl} gold><MessageCircle size={18} aria-hidden="true" />Join Discord</ExternalButton><Link className={`${styles.button} ${styles.heroOutline}`} href="/explore"><Users size={18} aria-hidden="true" />Explore Binexa Connect<ArrowRight size={17} aria-hidden="true" /></Link></div></section>
  </main>;
}
