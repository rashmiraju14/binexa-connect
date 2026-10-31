import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return { alternates: { canonical: `/resources/${encodeURIComponent(slug)}` } };
}

import { requireAccount } from "@/lib/auth/require-account";
import Link from 'next/link';import {notFound} from 'next/navigation';import {resources} from '@/lib/content';import {articleSections} from '@/lib/articles';import {ArrowLeft,ArrowUpRight} from 'lucide-react';
export const dynamic = "force-dynamic";
export default async function Article({params}:{params:Promise<{slug:string}>}){const {slug}=await params;await requireAccount(`/resources/${encodeURIComponent(slug)}`);const article=resources.find(r=>r.slug===slug);if(!article)notFound();return <main><div className="articlehero"><div className="shell"><Link className="backlink" href="/resources"><ArrowLeft size={15}/> All resources</Link><div className="eyebrow">{article.tag} · {article.readingTime} read</div><h1>{article.title}</h1><p className="lead">{article.description}</p></div></div><div className="shell articlelayout"><article className="articlebody">{articleSections[slug].map(s=><section key={s.heading}><h2>{s.heading}</h2><p>{s.body}</p></section>)}<div className="editorialnote"><strong>Educational information only.</strong> This guide does not provide a diagnosis, treatment recommendation or substitute for professional medical advice. Reviewed sources and content should receive appropriate editorial review before public publication.</div>{article.sourceUrl&&<p className="sourcelink">Further reading: <a target="_blank" rel="noopener noreferrer" href={article.sourceUrl}>{article.source} <ArrowUpRight size={14}/></a></p>}</article><aside className="sidecard"><h3>Keep exploring</h3><p>Curiosity is welcome here. Discover another guide or preview future community conversations.</p><Link className="btn small" href="/discussions">Explore discussions</Link></aside></div></main>}
