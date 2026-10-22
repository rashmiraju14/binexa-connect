import { discordJoinUrl } from "@/lib/discord/navigation";
import CommunityMemberCount from "@/components/CommunityMemberCount";

import { communityTabs } from "@/lib/communityCopy";
import LoungeVideos from "@/components/LoungeVideos";
import LearningLibrary from "@/components/LearningLibrary";
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

export default function Home({ authenticated = false }: { authenticated?: boolean }) {
  return (
    <main className="hero">
      <div className="shell home-layout">
        <WellnessCategories />

        <section
          className="home-welcome"
          aria-labelledby="welcome-title"
        >
          <span className="eyebrow">
            Personalized care, built around you
          </span>

          <h1 id="welcome-title">
            Feel Better
            <br />
            <em>Live Healthier</em>
            <br />
            Thrive Longer
          </h1>

          <p className="lead">
            Weight loss, men's sexual health, and wellness
            &amp; longevity treatments tailored to your goals,
            delivered through convenient online care.
          </p>

          <div className="actions"><Link href="/sign-up" className="btn gold">Join Binexa Connect →</Link></div>

          <CommunityMemberCount />

          <div className="actions">
            <a
              href={DISCORD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn"
            >
              Join Our Discord Community
              <ArrowRight size={16} />
            </a>

            <Link
              href="/offerings"
              className="textlink"
            >
              Explore wellness topics →
            </Link>
          </div>

          <section
            className="home-launch"
            aria-labelledby="launch-title"
          >
            <span className="pill">
              Coming Soon
            </span>

            <h2 id="launch-title">
              BinexaHealth Online Pharmacy
            </h2>

            <p>
              We're preparing to bring personalized online
              care to your wellness journey. Join our community
              for educational resources, meaningful discussions,
              and future launch updates.
            </p>

            <div className="home-launch-links">
              <a
                href={DISCORD_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                Join Our Discord Community →
              </a>

              <Link href="/events">
                See what's planned →
              </Link>

              <Link href="/start">
                Start here →
              </Link>
            </div>
          </section>

          <div className="proof">
            <ShieldCheck size={18} />
            <span>
              A welcoming space to{" "}
              <b>learn and connect.</b>
            </span>
          </div>

          <div className="heroart home-community">
            <div className="heroart-top">
              <strong>Your wellness community</strong>
              <p>
                Explore ideas. Share perspectives.
                Keep learning.
              </p>
            </div>

            <div className="mockrows">
              <Link
                href="/resources"
                className="mockrow"
              >
                <span className="roundicon">
                  <BookOpen size={20} />
                </span>

                <div>
                  <strong>Educational resources</strong>
                  <p className="home-row-description">
                    Helpful guides for your wellness journey
                  </p>
                </div>

                <ArrowRight size={16} />
              </Link>

              <Link
                href="/discussions"
                className="mockrow"
              >
                <span className="roundicon">
                  <MessageSquare size={20} />
                </span>

                <div>
                  <strong>Community discussions</strong>
                  <p className="home-row-description">
                    Meaningful conversations and fresh
                    perspectives
                  </p>
                </div>

                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      </div>

      <div className="shell home-learning">
        <section className="learning-section">
          <div className="learning-heading">
            <h2>
              Find your way into the community
            </h2>

            <p>
              Three easy ways to explore, connect,
              and take a practical next step.
            </p>
          </div>

          <div className="cardgrid">
            {communityTabs.map((tab) => (
              <Link
                className="card"
                key={tab.href}
                href={tab.href}
              >
                <span className="pill">
                  Explore
                </span>

                <h3>{tab.title}</h3>

                <p>{tab.description}</p>

                <span className="textlink">
                  Take a look →
                </span>
              </Link>
            ))}
          </div>
        </section>

        {authenticated ? <>
        <LearningLibrary
          title="Fresh ideas for your wellness journey"
          ids={[
            "glp-research",
            "aging-research",
            "brennan",
          ]}
        />

        <LearningLibrary
          title="Meet the ideas behind the expertise"
          subtitle="Public videos featuring clinicians from NIH and Mayo Clinic."
          kind="Video"
        />

        <LoungeVideos compact />

        </> : (
          <section className="learning-section">
            <div className="learning-heading">
              <h2>Your community is waiting</h2>
              <p>Create your free account or sign in to unlock articles, videos, resources, and all community tabs.</p>
            </div>
            <Link href="/sign-up" className="btn gold">Sign Up &amp; Unlock the Community →</Link>
          </section>
        )}

        <CommunityInvitation />
      </div>
    </main>
  );
}
