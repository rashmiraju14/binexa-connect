"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Camera, Film, Images } from "lucide-react";
import { binexaMoments, displayEventDate, hasVideo, pastEvents } from "@/lib/events";
import { MediaGallery, VideoPlayer } from "./EventsMedia";
import styles from "./EventHighlights.module.css";

export default function EventHighlights() {
  const [selected, setSelected] = useState("all");
  const events = selected === "all" ? pastEvents : pastEvents.filter(event => event.id === selected);
  const media = [...events.flatMap(event => event.gallery), ...(selected === "all" ? binexaMoments : [])];
  return <main className={styles.page}>
    <div className={`shell ${styles.back}`}><Link href="/events"><ArrowLeft size={15} aria-hidden="true" />Back to Events</Link></div>
    <header className={`shell ${styles.heading}`}><span>OUR COMMUNITY, IN FOCUS</span><h1>Our moments. Our story.</h1><p>Photographs, conversations, and video highlights from the Binexa journey.</p></header>
    <div className={`shell ${styles.content}`}>
      <div className={styles.filters} role="group" aria-label="Filter event highlights"><button type="button" aria-pressed={selected === "all"} onClick={() => setSelected("all")}><Images size={15} aria-hidden="true" />All highlights</button>{pastEvents.map(event => <button type="button" key={event.id} aria-pressed={selected === event.id} onClick={() => setSelected(event.id)}>{event.name}</button>)}</div>
      {events.map(event => <article className={styles.eventSummary} key={event.id} id={event.id}><span className={styles.eventIcon}><Camera size={25} strokeWidth={1.4} aria-hidden="true" /></span><div><span className={styles.category}>{event.category} · {event.status}</span><h2>{event.name}</h2><p className={styles.date}><CalendarDays size={15} aria-hidden="true" /><time dateTime={event.date}>{displayEventDate(event.date)}</time></p><p>{event.description}</p></div></article>)}
      <section className={styles.gallery} aria-labelledby="moments-gallery-title"><div className={styles.galleryHeading}><h2 id="moments-gallery-title">Photos & moments</h2>{media.length > 0 && <span>{media.length} {media.length === 1 ? "moment" : "moments"}</span>}</div>{media.length > 0 ? <MediaGallery items={media} title="Binexa event photos and moments" /> : <div className={styles.awaiting}><div className={styles.photoIcon}><Camera size={36} strokeWidth={1.2} aria-hidden="true" /></div><h3>Our event photos are on their way.</h3><p>This is where we’ll share the people, connections, and little moments from our community events.</p><span>Awaiting actual Binexa event photos</span></div>}</section>
      {events.some(event => hasVideo(event.recap)) ? events.filter(event => hasVideo(event.recap)).map(event => <section className={styles.recap} key={event.id} id={`${event.id}-recap`}><h2>{event.name} · Video highlights</h2>{event.recap && <VideoPlayer video={event.recap} title={`${event.name} recap`} />}</section>) : <div className={styles.videoNote}><Film size={23} strokeWidth={1.4} aria-hidden="true" /><div><h3>Video highlights</h3><p>Event recaps will appear here when an official video is available.</p></div></div>}
    </div>
  </main>;
}
