"use client";
import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";

export default function PrivacyVideo({ id, title }: { id: string; title: string }) {
  const [play, setPlay] = useState(false);
  const [thumbnailFailed, setThumbnailFailed] = useState(false);
  return play ? <iframe className="learning-video" src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1`} title={title} allow="encrypted-media; picture-in-picture; autoplay" allowFullScreen /> :
    <button type="button" className="video-thumbnail" aria-label={`Watch ${title}`} onClick={() => setPlay(true)}>
      {!thumbnailFailed && <Image src={`https://i.ytimg.com/vi/${encodeURIComponent(id)}/hqdefault.jpg`} alt="" width={480} height={360} unoptimized onError={() => setThumbnailFailed(true)} />}
      {thumbnailFailed && <span className="video-thumbnail-fallback">{title}</span>}
      <span className="video-thumbnail-icon" aria-hidden="true"><Play size={28} fill="currentColor" /></span>
    </button>;
}
