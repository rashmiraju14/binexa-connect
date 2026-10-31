import Image from "next/image";
import FounderProfiles from "@/components/FounderProfiles";
import { discordJoinUrl } from "@/lib/discord/navigation";
import CommunityMemberCount from "@/components/CommunityMemberCount";
import PharmacyAnnouncement from "@/components/PharmacyAnnouncement";

import CommunityInvitation from "@/components/CommunityInvitation";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import WellnessCategories from "@/components/WellnessCategories";

const DISCORD_URL = discordJoinUrl;
const communityPaths = [
  { href: "/start", title: "Start Here", label: "Find your starting point", image: "/images/home-benefits/start-circle-v2.jpg", imageAlt: "A person learning on a laptop", description: "New to Binexa Connect? Choose your interests and discover where to begin.", highlights: ["Choose the topics that matter to you", "Find your first community conversation"], action: "Find my starting point", tone: "welcome" },
  { href: "/habits", title: "Small Habits", label: "Make room for everyday progress", image: "/images/home-benefits/habits-circle-v2.jpg", imageAlt: "A colorful fresh salad with avocado", description: "Choose one manageable habit and use the weekly planner to notice your progress.", highlights: ["Pick a realistic step for your week", "Check in without pressure to be perfect"], action: "Explore small habits", tone: "habits" },
  { href: "/lounge", title: "Community Lounge", label: "Fresh ideas for your downtime", image: "/images/home-benefits/lounge-circle-v2.jpg", imageAlt: "People enjoying a meal together", description: "Find a recipe, explore a movement practice, or enjoy a lighter moment.", highlights: ["Browse health, cooking, and yoga videos", "Discover practical guides and fresh ideas"], action: "Visit the lounge", tone: "lounge" },
];

export default function Home({ authenticated = false }: { authenticated?: boolean }) {
  return (
    <main className="hero">
      <div className="shell pharmacy-announcement-wrap"><PharmacyAnnouncement /></div>

      <div className="shell home-headline">
          <h1 id="welcome-title">
            Feel Better. <em>Live Healthier.</em> Thrive Longer.
          </h1>
          <span className="eyebrow">
            Personalized care, built around you
          </span>

          <p className="lead">
            Weight loss, men's sexual health, and wellness
            &amp; longevity treatments tailored to your goals,
            delivered through convenient online care.
          </p>


      </div>

      <div className="shell home-layout">
        <WellnessCategories />

        <section
          className="home-welcome"
          aria-label="Personalized care and community"
        >
          <div className="community-access-details">
          <div className="actions home-account-actions">
            <Link href="/sign-in" className="btn home-signin">Sign In</Link>
            <a
              href={DISCORD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn ghost"
            >
              Join Our Discord Community
              <ArrowRight size={16} />
            </a>
          </div>

          <CommunityMemberCount />

          <div className="actions">
            <Link
              href="/offerings"
              className="textlink"
            >
              Explore wellness topics →
            </Link>
          </div>

          <div className="proof">
            <ShieldCheck size={18} />
            <span>
              A welcoming space to{" "}
              <b>learn and connect.</b>
            </span>
          </div>

          </div>
          <aside className="pharmacy-feature-card" aria-labelledby="pharmacy-feature-title">
            <div className="pharmacy-feature-top"><Image src="/branding/binexa-icon.png" alt="" width={52} height={52} /><span>COMING SOON</span></div>
            <h2 id="pharmacy-feature-title">BinexaHealth<br />Online Pharmacy</h2>
            <p>Personalized online care is on the horizon. Explore wellness resources and community conversations while we prepare for launch.</p>
            <Link href="/events">See what’s ahead <ArrowRight size={16} aria-hidden="true" /></Link>
          </aside>
        </section>
      </div>

      <div className="shell home-learning">
        <section className="learning-section community-pathways" aria-labelledby="community-pathways-title">
          <div className="learning-heading">
            <span className="eyebrow">YOUR NEXT STEP, YOUR CHOICE</span>
            <h2 id="community-pathways-title">Find your way into the community</h2>
            <p>Start somewhere that feels right for you. Get your bearings, build a small routine, or find a little inspiration.</p>
          </div>
          <div className="community-path-grid">
            {communityPaths.map(path => (
              <Link className={`community-path-card community-path-${path.tone}`} key={path.href} href={path.href}>
                <div className="community-path-top"><span className="community-path-photo"><Image src={path.image} alt={path.imageAlt} fill sizes="64px" /></span><span className="community-path-label">{path.label}</span></div>
                <div className="community-path-body"><h3>{path.title}</h3><p>{path.description}</p>
                  <ul>{path.highlights.map(highlight => <li key={highlight}>{highlight}</li>)}</ul>
                  <span className="community-path-action">{path.action}<ArrowRight size={19} aria-hidden="true" /></span>
                </div>
              </Link>
            ))}
          </div>
          {!authenticated && <p className="community-path-note">Choose a path to create your free account or sign in. Your account unlocks all community tabs.</p>}
        </section>

        <section className="learning-section home-member-benefits" aria-labelledby="member-benefits-title">
          <div className="learning-heading">
            <p className="eyebrow">MAKE THIS COMMUNITY YOURS</p>
            <h2 id="member-benefits-title">A helpful place to start your wellness journey</h2>
            <p>You don’t need to have all the answers. Find clear information, explore what matters to you, and connect with people who are curious too.</p>
          </div>
          <div className="cardgrid">
            <article className="card home-benefit-card"><div className="home-benefit-image"><Image src="/images/home-benefits/learning-daylight.jpg" alt="People smiling and learning together around a table" fill sizes="(max-width: 700px) calc(100vw - 40px), (max-width: 900px) 45vw, 360px" /></div><div className="home-benefit-body"><BookOpen color="#D39A22" /><h3>Find information you can understand</h3><p>Explore written guides and original health sources. Learn how to ask better questions and make sense of research headlines.</p><Link href="/resources" className="textlink">Explore educational resources →</Link></div></article>
            <article className="card home-benefit-card"><div className="home-benefit-image"><Image src="/images/home-benefits/healthy-colorful.jpg" alt="A bright selection of colorful vegetables and bowl ingredients" fill sizes="(max-width: 700px) calc(100vw - 40px), (max-width: 900px) 45vw, 360px" /></div><div className="home-benefit-body"><ShieldCheck color="#D39A22" /><h3>Choose what matters to you</h3><p>Start with weight health, healthy aging, nutrition, or men’s health. Follow your interests and take learning at your own pace.</p><Link href="/offerings" className="textlink">Find your health topic →</Link></div></article>
            <article className="card home-benefit-card"><div className="home-benefit-image"><Image src="/images/home-benefits/community-daylight.jpg" alt="Friends standing together outdoors in warm sunlight" fill sizes="(max-width: 700px) calc(100vw - 40px), (max-width: 900px) 45vw, 360px" /></div><div className="home-benefit-body"><MessageSquare color="#D39A22" /><h3>Feel part of a community</h3><p>Ask thoughtful questions, share perspectives, and connect through discussions and our Discord community.</p><Link href="/discussions" className="textlink">Explore community discussions →</Link></div></article>
          </div>
          <div className="home-getting-started">
            <h3>{authenticated ? "Make your next visit count" : "Getting started is simple"}</h3>
            <ol>
              <li><strong>{authenticated ? "Pick your next topic." : "Create your free account."}</strong> {authenticated ? "Choose a subject you’d like to understand better." : "Sign up or sign in to unlock member pages."}</li>
              <li><strong>Explore one helpful resource.</strong> Read a guide and save a question for your next healthcare conversation.</li>
              <li><strong>Connect in your own way.</strong> Join a discussion or visit Discord when you feel ready.</li>
            </ol>
            <Link href={authenticated ? "/explore" : "/sign-up"} className="btn gold">{authenticated ? "Explore your community →" : "Create My Free Account →"}</Link>
            <p className="muted">Educational information and shared experiences. For personal medical advice, speak with a qualified healthcare professional.</p>
          </div>
        </section>

        <CommunityInvitation />
        <section className="learning-section home-about" aria-labelledby="about-binexa-title">
          <p className="eyebrow">ABOUT BINEXA CONNECT</p>
          <h2 id="about-binexa-title">A community built around connection</h2>
          <p>Co-founded by <strong><a href="/about#binh-diep-bio" data-founder-bio="binh-diep-bio" aria-haspopup="dialog">Binh Diep</a></strong>, Founder &amp; CEO of BinexaHealth, and <strong><a href="/about#rashmi-thimmaraju-bio" data-founder-bio="rashmi-thimmaraju-bio" aria-haspopup="dialog">Rashmi Thimmaraju</a></strong>, Technical Co-founder, Binexa Connect brings wellness education and community conversations together.</p>
          <FounderProfiles />
          <Link href="/about" className="textlink">Meet our co-founders &amp; learn about Binexa →</Link>
          <p className="muted">For education only. Not medical advice. <Link href="/privacy">Privacy &amp; Cookie Notice</Link></p>
        </section>
      </div>
    </main>
  );
}
