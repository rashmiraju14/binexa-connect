"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import { newReleases, releaseCategories, sortReleases, formatReleaseDate, type NewRelease, type ReleaseCategory } from "@/lib/new-releases";
import styles from "./ResearchInsights.module.css";

type PeptidesSlot = { id: "peptides"; category: "Skin Care"; published: "2026-10-09"; content: ReactNode };

export default function ResearchInsights({ peptides }: { peptides?: ReactNode } = {}) {
  const [category, setCategory] = useState<ReleaseCategory>("All Updates");
  const collection: (NewRelease | PeptidesSlot)[] = [...newReleases];
  if (peptides) collection.push({ id: "peptides", category: "Skin Care", published: "2026-10-09", content: peptides });
  const items = sortReleases(collection).filter(item => category === "All Updates" || item.category === category);

  return <section aria-label="New Releases sources by category">
    <div className={`lounge-topic-filters ${styles.filters}`} role="group" aria-label="Filter New Releases by category">
      {releaseCategories.map(label => <button type="button" key={label} aria-pressed={category === label} onClick={() => setCategory(label)}>{label}</button>)}
    </div>
    <p className={styles.count} role="status">{items.length} {items.length === 1 ? "source" : "sources"} · {category}</p>
    <p className={styles.context}>Binexa editorial summaries introduce the linked sources. The FDA safety update is featured first; other items follow publication dates, newest first. Undated resources appear last.</p>
    <div className={`learning-grid ${styles.grid}`}>
      {items.map(item => "content" in item ? <div key={item.id} className={styles.peptides} data-release-id={item.id}>{item.content}</div> :
        <article className={`learning-card ${item.id === "fda-glp1-vision" ? styles.featured : ""}`} key={item.id} data-release-id={item.id}>
          {item.thumbnail && <Image className={styles.thumbnail} src={item.thumbnail.src} alt={item.thumbnail.alt} width={640} height={360} unoptimized />}
          <div className="learning-card-body">
            {item.id === "fda-glp1-vision" && <strong className={styles.featureLabel}>Featured safety update</strong>}
            <span className="pill">{item.category}</span>
            <p className={styles.kind}>{item.kind}</p>
            <span className="postmeta">Binexa editorial summary</span>
            <h2 className={styles.cardTitle}>{item.title}</h2>
            <p>{item.summary}</p>
            <p className="postmeta">{item.publisher}<br />{item.published ? <>{item.dateLabel || "Published"} <time dateTime={item.published}>{formatReleaseDate(item.published)}</time></> : "Publication date not provided by publisher"}</p>
            <a className="textlink content-action" href={item.url} target="_blank" rel="noopener noreferrer">Read Original Source ↗</a>
          </div>
        </article>)}
    </div>
  </section>;
}
