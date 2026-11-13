import Image from "next/image";
import Link from "next/link";
import { resources } from "@/lib/content";
import { ArrowUpRight } from "lucide-react";
import styles from "./stories.module.css";
export const storyImages: Record<string, string> = {
  "healthy-habits-that-stick": "/images/home-benefits/healthy-colorful.jpg",
  "understanding-weight-care": "/images/wellness-weight-v3.jpg",
  "spotting-credible-wellness-info": "/images/home-benefits/learning-daylight.jpg",
};
export default function EditorialStories() {
  return <section className={`shell home-wellness wellness-editorial ${styles.section}`} aria-labelledby="stories-title">
    <div className="wellness-editorial-heading">
      <span className="wellness-editorial-eyebrow">THE WELLNESS EDIT</span>
      <h2 id="stories-title" className={styles.title}>A little curiosity. <span>A healthier everyday.</span></h2>
      <p>Thoughtful stories. Grounded insights. A fresh perspective on living well.</p>
    </div>
    <div className="wellness-editorial-grid" tabIndex={0} role="region" aria-label="Selected stories">
      {["healthy-habits-that-stick", "understanding-weight-care", "spotting-credible-wellness-info"].map(slug => {
        const story = resources.find(r => r.slug === slug)!;
        return <Link key={slug} href={`/resources/${slug}`} className="wellness-editorial-card">
          <div className="wellness-editorial-photo">
            <Image src={storyImages[slug]} alt={slug === "healthy-habits-that-stick" ? "Colorful vegetables and ingredients for an everyday meal" : slug === "understanding-weight-care" ? "An everyday approach to weight and wellbeing" : "People learning together around a table"} fill sizes="(max-width: 700px) 90vw, (max-width: 1000px) 30vw, 23vw" style={{ objectFit: "cover", objectPosition: "center" }} />
          </div>
          <div className="wellness-editorial-content">
            <span className="wellness-editorial-label">{story.tag} · {story.readingTime} read</span>
            <h3>{story.title}</h3>
            <p>{story.description}</p>
            <span className="wellness-editorial-action">Read the story <ArrowUpRight size={16} aria-hidden="true" /></span>
          </div>
        </Link>;
      })}
    </div>
  </section>;
}
