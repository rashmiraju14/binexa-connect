"use client";
import { useState } from "react";
export default function PrivacyVideo({ id, title }: { id: string; title: string }) {
  const [play, setPlay] = useState(false);
  return play ? <iframe className="learning-video" src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1`} title={title} allow="encrypted-media; picture-in-picture; autoplay" allowFullScreen /> :
    <div className="video-consent"><button type="button" className="btn ghost" onClick={() => setPlay(true)}>Play video</button><p>Playing connects to YouTube, which receives your IP address and may use its own storage. <a href="/privacy#videos">Learn more</a>.</p></div>;
}
