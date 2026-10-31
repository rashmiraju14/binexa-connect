import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const categories = [
  { href: "/offerings#weight-health", title: "Weight Loss", image: "/images/wellness-weight-v3.jpg", alt: "Preparing a nourishing meal in a bright home kitchen", label: "NOURISH & FLOURISH", description: "Build a healthier relationship with everyday nutrition and weight management.", position: "center" },
  { href: "/offerings#healthy-aging", title: "Longevity & Wellness", image: "/images/wellness-aging-v3.jpg", alt: "An older couple enjoying a walk in a leafy park", label: "LIVE WELL, AGE WELL", description: "Explore small, meaningful steps toward a more active and fulfilling life.", position: "center" },
  { href: "/offerings#mens-health", title: "Men’s Sexual Health", image: "/images/wellness-mens-v3.jpg", alt: "A man relaxing outdoors in natural daylight", label: "CONFIDENCE & CONNECTION", description: "Clear, thoughtful education to help you understand your wellbeing.", position: "center" },
];

export default function WellnessCategories() {
  return (
    <section className="home-wellness wellness-editorial" aria-labelledby="wellness-title">
      <div className="wellness-editorial-heading">
        <span className="wellness-editorial-eyebrow">A LITTLE KNOWLEDGE. A HEALTHIER YOU.</span>
        <h2 id="wellness-title">Explore your wellness journey.</h2>
        <p>Fresh perspectives and practical knowledge for every chapter of life.</p>
      </div>
      <div className="wellness-editorial-grid">
        {categories.map((item) => (
          <Link key={item.href} className="wellness-editorial-card" href={item.href}>
            <div className="wellness-editorial-photo">
              <Image src={item.image} alt={item.alt} fill sizes="(max-width: 700px) 90vw, (max-width: 1000px) 30vw, 23vw" style={{ objectFit: "cover", objectPosition: item.position }} />
            </div>
            <div className="wellness-editorial-content">
              <span className="wellness-editorial-label">{item.label}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <span className="wellness-editorial-action">Explore topic <ArrowUpRight size={16} aria-hidden="true" /></span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
