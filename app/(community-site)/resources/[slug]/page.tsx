import { requireAccount } from "@/lib/auth/require-account";
import { isPublicArticle } from "@/lib/auth/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { resources } from "@/lib/content";
import { articleSections } from "@/lib/articles";
import { storyImages } from "@/components/EditorialStories";
import styles from "@/components/editorial.module.css";
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return { alternates: { canonical: `/resources/${encodeURIComponent(slug)}` } };
}
export default async function Article({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isPublicArticle(slug)) await requireAccount(`/resources/${encodeURIComponent(slug)}`);
  const article = resources.find(r => r.slug === slug);
  if (!article || !articleSections[slug]) notFound();
  return <main className={styles.reader}><Link href="/">← Back to Home</Link><header className={styles.articleHeader}><p className={styles.kicker}>{article.tag} · {article.readingTime} read</p><h1>{article.title}</h1><p className={styles.dek}>{article.description}</p><p className={styles.byline}>By Binexa Connect Editorial · A guide for everyday curiosity</p></header>{storyImages[slug] && <div className={styles.articleImage}><Image src={storyImages[slug]} alt="" fill sizes="(max-width: 700px) 100vw, 960px" priority /></div>}<article className={styles.body}>{articleSections[slug].map(section => <section key={section.heading}><h2>{section.heading}</h2><p>{section.body}</p></section>)}{article.sourceUrl && <p>Continue learning: <a target="_blank" rel="noopener noreferrer" href={article.sourceUrl}>{article.source} ↗</a></p>}<p className={styles.note}>Educational information only. This guide does not provide a diagnosis, treatment recommendation, or substitute for advice from a qualified healthcare professional.</p></article><p className={styles.body}><Link href="/">← Back to Home</Link></p></main>;
}
