import Image from "next/image";
import Link from "next/link";

const categories = [
  {
    href: "/offerings#weight-health",
    title: "Weight Loss",
    image: "/images/weightloss-image.png",
    imagePosition: "center",
    description: "Explore healthy weight management and metabolic wellness.",
  },
  {
    href: "/offerings#healthy-aging",
    title: "Longevity & Wellness",
    image: "/images/longivity-wellness-image.png",
    imagePosition: "center",
    description: "Learn about healthy aging and everyday wellbeing.",
  },
  {
    href: "/offerings#mens-health",
    title: "Men's Sexual Health",
    image: "/images/mens sexual health image.png",
    imagePosition: "center 18%",
    description: "Discover trusted education about men's sexual wellness.",
  },
];

export default function WellnessCategories() {
  return (
    <section className="home-wellness" aria-labelledby="wellness-title">
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <h2 id="wellness-title" style={{ color: "#082B50", fontSize: 36 }}>
          Explore Your Wellness Journey
        </h2>

        <p style={{ color: "#667786", marginBottom: 30 }}>
          Discover helpful information and explore topics that matter to you.
        </p>

        <div className="home-wellness-grid">
          {categories.map((item) => (
            <div
              key={item.title}
              style={{
                background: "white",
                borderRadius: 18,
                overflow: "hidden",
                boxShadow: "0 8px 24px rgba(8,43,80,0.08)",
              }}
            >
              <div style={{ position: "relative", height: 280 }}>
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 700px) 100vw, (max-width: 1000px) 50vw, 30vw"
                  style={{ objectFit: "cover", objectPosition: item.imagePosition }}
                />
              </div>

              <div style={{ padding: 24 }}>
                <h3 style={{ color: "#082B50", fontSize: 22 }}>
                  {item.title}
                </h3>

                <p style={{ color: "#667786", marginTop: 10 }}>
                  {item.description}
                </p>
                <Link className="textlink" href={item.href}>Explore articles and videos →</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
