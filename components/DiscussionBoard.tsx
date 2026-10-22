"use client";

import { useState, type FormEvent } from "react";
import { ArrowUpRight, Hash, MessageCircle, Search, Send, ShieldCheck, Sparkles } from "lucide-react";
import { discordJoinUrl } from "@/lib/discord/navigation";

const channels = [
  { id: "welcome", name: "Introductions", description: "Start with a hello. Tell us what you’re curious about.", prompt: "What would you love to learn here? Share an interest, a favorite routine, or a topic you’d like to explore." },
  { id: "wellness", name: "Everyday wellness", description: "Small routines, fresh ideas, and everyday wellbeing.", prompt: "What is one small habit that brightens your day? Think of something simple enough to repeat." },
  { id: "weight", name: "Weight health", description: "Supportive conversations about sustainable habits.", prompt: "What makes healthy routines easier during a busy week? Share practical ideas without diet pressure or personal medical details." },
  { id: "aging", name: "Healthy aging", description: "Explore strength, movement, and longevity research.", prompt: "What would you ask before trusting a longevity headline? Start with who was studied and what was measured." },
  { id: "mens", name: "Men’s health", description: "A respectful space for general sexual-wellness education.", prompt: "What makes a sexual-health article approachable? Discuss useful language and trustworthy sources, keeping personal health details private." },
  { id: "tech", name: "AI & health tech", description: "New technology, thoughtful questions, human perspectives.", prompt: "Where could AI help healthcare? Consider evidence, privacy, and the role of qualified clinicians." },
];
type Message = { id: number; channel: string; text: string; time: string };

export default function DiscussionBoard() {
  const [active, setActive] = useState("welcome");
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [notice, setNotice] = useState("");
  const channel = channels.find(item => item.id === active)!;
  const visibleMessages = messages.filter(item => item.channel === active);
  function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setMessages(items => [...items, { id: Date.now(), channel: active, text, time: new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(new Date()) }]);
    setDraft("");
    setNotice("Preview message added. Only you can see it; refresh clears preview messages.");
  }
  return <div className="discussion-workspace">
    <aside className="discussion-sidebar">
      <div className="discussion-brand"><span className="discussion-symbol"><MessageCircle size={22}/></span><div><strong>The conversation space</strong><small>Binexa Connect</small></div></div>
      <label className="channel-search"><Search size={16}/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Find a channel" aria-label="Find a discussion channel"/></label>
      <div className="discussion-label">Your channels</div>
      <nav className="discussion-channels" aria-label="Discussion channels">{channels.filter(item => item.name.toLowerCase().includes(query.toLowerCase())).map(item => <button type="button" key={item.id} className={active === item.id ? "channel-button selected" : "channel-button"} aria-pressed={active === item.id} onClick={() => {setActive(item.id);setDraft("");setNotice("");}}><Hash size={17}/><span>{item.name}</span>{active === item.id && <span className="channel-active-dot"/>}</button>)}{!channels.some(item => item.name.toLowerCase().includes(query.toLowerCase())) && <p className="channel-no-results">No channels match your search.</p>}</nav>
      <div className="sidebar-invitation"><Sparkles size={20}/><h3>Good conversations start with curiosity.</h3><p>Meet the community and bring your questions to Discord.</p><a href={discordJoinUrl} className="btn gold">Join Our Discord Community <ArrowUpRight size={15}/></a></div>
    </aside>
    <section className="discussion-chat" aria-labelledby="active-channel-title">
      <header className="chat-header"><div><h2 id="active-channel-title"><Hash size={23}/>{channel.name}</h2><p>{channel.description}</p></div><span className="chat-preview-badge">Design preview</span></header>
      <div className="chat-preview-note"><ShieldCheck size={18}/><span>Try the board below. Preview messages stay in this page only. Member conversations happen on <a href={discordJoinUrl}>Discord ↗</a>.</span></div>
      <div className="chat-conversation">
        <div className="conversation-divider"><span>Let’s get the conversation started</span></div>
        <article className="chat-message"><div className="chat-avatar editorial">B</div><div className="chat-message-content"><div className="chat-message-meta"><strong>Binexa Editorial</strong><span className="editorial-badge">Conversation starter</span></div><p>{channel.prompt}</p><a className="textlink" href="/resources">Find an article to share <ArrowUpRight size={14}/></a></div></article>
        {visibleMessages.length === 0 && <div className="conversation-empty"><div className="conversation-empty-icon"><MessageCircle size={26}/></div><h3>Your perspective belongs here.</h3><p>Try a message in this preview, or join Discord to chat with members.</p></div>}
        <div aria-live="polite" aria-relevant="additions">{visibleMessages.map(message => <article className="chat-message own-message" key={message.id}><div className="chat-avatar">Y</div><div className="chat-message-content"><div className="chat-message-meta"><strong>You</strong><span>Private preview · {message.time}</span></div><p>{message.text}</p></div></article>)}</div>
      </div>
      <form className="chat-composer" onSubmit={send}><label htmlFor="discussion-message">Your message in #{channel.name.toLowerCase().replaceAll(" ", "-")}</label><textarea id="discussion-message" value={draft} onChange={event => setDraft(event.target.value)} maxLength={1000} rows={3} placeholder="Share a thought, ask a question, or tell us what you’re learning…"/><div className="composer-footer"><span>{draft.length}/1000 · Visible only to you</span><button type="submit" className="btn" disabled={!draft.trim()}>Send preview <Send size={15}/></button></div><p className="composer-notice" role="status">{notice || "Preview messages clear when you refresh. Join Discord for member chat."}</p></form>
    </section>
    <aside className="discussion-details"><span className="discussion-label">About this space</span><h3>Learn together.<br/>Connect with care.</h3><p>A community for thoughtful wellness conversations and useful discoveries.</p><div className="board-guidelines"><ShieldCheck size={22}/><h4>A few shared values</h4><ul><li>Be kind and make room for different perspectives.</li><li>Share original sources when discussing research.</li><li>Keep personal medical details private.</li><li>Ask a clinician about personal care decisions.</li></ul></div><a className="board-resource-link" href="/resources"><span>Need a little inspiration?<strong>Explore the reading library</strong></span><ArrowUpRight size={19}/></a><a className="btn gold" href={discordJoinUrl}>Join Our Discord Community <ArrowUpRight size={15}/></a></aside>
  </div>;
}
