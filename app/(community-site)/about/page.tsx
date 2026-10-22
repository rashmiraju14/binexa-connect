import FounderProfiles from "@/components/FounderProfiles";
import Link from "next/link";
export const metadata = { title: "About Binexa Connect" };
export default function AboutPage() {
  return <main className="shell policy-page"><p className="eyebrow">ABOUT BINEXA CONNECT</p><h1>Learn. Connect. Thrive.</h1><p className="lead">Binexa Connect brings wellness education and community conversations together in one welcoming place.</p>
    <section><h2>Our community</h2><p>Explore educational resources about weight management, healthy aging, everyday wellbeing, and men’s sexual health. Members can discover articles and videos, explore small habits, and participate in community experiences.</p><p>Our Discord community gives members another place to connect and share perspectives.</p></section>
    <section><h2>Our co-founders</h2><FounderProfiles /></section>
    <section><h2>Education and connection</h2><p>Binexa Connect’s community content is educational. It does not provide a diagnosis, individualized treatment, or a substitute for advice from a qualified healthcare professional.</p></section><Link href="/" className="textlink">Back to the community →</Link>
  </main>;
}
