
import Image from "next/image";
import Link from "next/link";

const benefits = [
  {
    icon: "✦",
    title: "A Supportive Community",
    description:
      "Connect with people who share an interest in healthier living, meaningful conversations, and personal growth.",
  },
  {
    icon: "✧",
    title: "Learn & Discover",
    description:
      "Explore wellness education, longevity insights, and the evolving world of AI and healthcare.",
  },
  {
    icon: "♡",
    title: "Grow Together",
    description:
      "Discover community conversations, resources, and activities that encourage healthy habits.",
  },
];

export default function LandingPage() {
  return (
    <main className="binexa-landing">
      <header className="landing-header">
        <Link href="/" className="landing-brand">
          <Image
            src="/branding/binexa-icon.png"
            alt="BinexaHealth logo"
            width={48}
            height={48}
            className="landing-logo-icon"
          />
          <span>
            Binexa<span className="gold-text">Health</span>
            <small>CONNECT</small>
          </span>
        </Link>

        <nav className="landing-nav" aria-label="Main navigation">
          <a href="#about">About</a>
          <a href="#benefits">Why Join</a>
          <a href="#community">Community</a>
        </nav>

        <div className="landing-header-actions">
          <Link href="/sign-in" className="landing-signin">
            Sign In
          </Link>
          <a
            href="https://discord.gg/uGWdz6Bem"
            target="_blank"
            rel="noopener noreferrer"
            className="landing-btn landing-btn-gold"
          >
            Join Discord Community ↗
          </a>
        </div>
      </header>

      <section className="landing-hero" id="about">
        <div className="landing-hero-copy">
          <p className="landing-eyebrow">
            WELCOME TO BINEXA CONNECT
          </p>

          <h1>
            Feel Better
            <br />
            <span className="gold-text">Live Healthier</span>
            <br />
            Thrive Longer
          </h1>

          <p className="landing-intro">
            Your space for meaningful connections, wellness
            education, inspiring conversations, and a healthier
            tomorrow.
          </p>

          <div className="landing-hero-actions">
            <a
              href="https://discord.gg/uGWdz6Bem"
              target="_blank"
              rel="noopener noreferrer"
              className="landing-btn landing-btn-gold"
            >
              Step 1 — Join Our Discord Community ↗
            </a>
            <Link href="/sign-up" className="landing-btn landing-btn-outline">
              Step 2 — Create Account &amp; Verify Membership →
            </Link>
          </div>

          <p className="landing-access-note">
            🔒 Discord membership is required before you can access the Binexa Connect website.
          </p>
        </div>

        <div
          className="landing-hero-art"
          aria-label="BinexaHealth wellness illustration"
        >
          <div className="landing-orbit orbit-one" />
          <div className="landing-orbit orbit-two" />
          <div className="landing-art-glow" />

          <div className="landing-floating-symbol symbol-heart">
            ♥
          </div>
          <div className="landing-floating-symbol symbol-plus">
            ✚
          </div>
          <div className="landing-floating-symbol symbol-sparkle">
            ✦
          </div>

          <div
            className="landing-logo-stage"
            aria-hidden="true"
          />

          <div className="binexa-3d-scene">
            <div className="binexa-3d-logo">
              <Image
                src="/branding/binexa-icon.png"
                alt="BinexaHealth official gold and blue symbol"
                width={370}
                height={370}
                priority
                className="binexa-logo-image"
              />
            </div>
          </div>

          <div className="landing-art-caption">
            <span className="caption-dot" />
            CONNECT • LEARN • THRIVE
          </div>
        </div>
      </section>

      <section
        className="landing-topic-strip"
        aria-label="Community interests"
      >
        <span>Community</span>
        <span>Education</span>
        <span>Wellness</span>
        <span>Longevity</span>
        <span>AI & Health Tech</span>
      </section>

      <section className="landing-benefits" id="benefits">
        <div className="landing-section-heading">
          <p className="landing-eyebrow">
            MORE THAN A COMMUNITY
          </p>

          <h2>Why Join Binexa Connect?</h2>

          <p>
            A welcoming place to learn, exchange ideas, and build
            stronger connections throughout your wellness journey.
          </p>
        </div>

        <div className="landing-benefit-grid">
          {benefits.map((benefit) => (
            <article
              className="landing-benefit-card"
              key={benefit.title}
            >
              <div className="landing-benefit-icon">
                {benefit.icon}
              </div>
              <h3>{benefit.title}</h3>
              <p>{benefit.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-community-cta" id="community">
        <p className="landing-eyebrow">YOUR COMMUNITY STARTS HERE</p>
        <h2>Join Discord. Connect. Thrive.</h2>
        <p>
          Become part of our Discord community first.
          Once you’ve joined, create your Binexa Connect account and verify your
          Discord membership to unlock the website.
        </p>
        <div className="landing-hero-actions">
          <a
            href="https://discord.gg/uGWdz6Bem"
            target="_blank"
            rel="noopener noreferrer"
            className="landing-btn landing-btn-gold"
          >
            Step 1 — Join Discord ↗
          </a>
          <Link href="/sign-up" className="landing-btn landing-btn-outline">
            Step 2 — Verify &amp; Get Access →
          </Link>
        </div>
        <p className="landing-access-note">
          Already have a Binexa Connect account?{" "}
          <Link href="/sign-in">Sign in to verify membership</Link>
        </p>
      </section>

      <footer className="landing-footer">
        <div className="landing-footer-brand">
          <Image
            src="/branding/binexa-icon.png"
            alt=""
            width={30}
            height={30}
          />
          <span>BinexaHealth · Connect</span>
        </div>

        <p>
          © {new Date().getFullYear()} BinexaHealth.
          All rights reserved.
        </p>

        <p>
          Community information is educational
          and not medical advice.
        </p>
      </footer>
    </main>
  );
}
