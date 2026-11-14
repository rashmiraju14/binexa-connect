"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { learningItems } from "@/lib/learning";
import styles from "./ResearchInsights.module.css";

const categories = [
  { label: "Latest Research", topic: null },
  { label: "Weight & Metabolism", topic: "Weight health" },
  { label: "Longevity & Wellness", topic: "Healthy aging" },
  { label: "Men's Health", topic: "Men’s health" },
] as const;

// Reuse existing NIH reports whose original source pages were verified for this view.
const verifiedIds = new Set(["glp-research", "aging-research"]);
const researchItems = learningItems.filter(item => item.kind === "Research" && verifiedIds.has(item.id));

export default function ResearchInsights() {
  const [category, setCategory] = useState<(typeof categories)[number]["label"]>("Latest Research");
  const topic = categories.find(item => item.label === category)?.topic;
  const items = researchItems.filter(item => !topic || item.topic === topic);

  return <section aria-label="Research sources by category">
    <div className={`lounge-topic-filters ${styles.filters}`} role="group" aria-label="Filter research by category">
      {categories.map(item => <button type="button" key={item.label} aria-pressed={category === item.label} onClick={() => setCategory(item.label)}>{item.label}</button>)}
    </div>
    <p className={styles.count} role="status">{items.length} research {items.length === 1 ? "source" : "sources"} · {category}</p>
    {items.length > 0 ? <div className={`learning-grid ${styles.grid}`}>
      {items.map(item => <article className="learning-card" key={item.id}>
        <div className="learning-card-body">
          <span className="pill">{categories.find(value => value.topic === item.topic)?.label} · Research explainer</span>
          <h2 className={styles.cardTitle}>{item.title}</h2>
          <p>{item.description}</p>
          <div className="postmeta">{item.publisher}{item.date && <><br />{item.date}</>}</div>
          <a className="textlink content-action" href={item.url} target="_blank" rel="noopener noreferrer">Read original source ↗</a>
        </div>
      </article>)}
    </div> : <div className={`learning-card ${styles.empty}`}>
      <BookOpen size={28} color="#D39A22" aria-hidden="true" />
      <h2>No research listed yet</h2>
      <p>No verified research sources are listed in {category} yet. Browse the current research selection or explore our educational resources.</p>
      <div className={styles.emptyActions}>
        <button type="button" className="btn small" onClick={() => setCategory("Latest Research")}>View latest research</button>
        <Link className="textlink" href="/resources">Browse resources →</Link>
      </div>
    </div>}
  </section>;
}
