import FounderProfiles from "@/components/FounderProfiles";
import Link from "next/link";
export const metadata = { title: "About Binexa Connect" };
export default function AboutPage() {
  return <main className="shell policy-page"><p className="eyebrow">ABOUT BINEXA CONNECT</p><h1>Learn. Connect. Thrive.</h1><p className="lead">Binexa Connect brings wellness education and community conversations together in one welcoming place.</p>
    <section><h2>Our community</h2><p>Explore educational resources about weight management, healthy aging, everyday wellbeing, and men’s sexual health. Members can discover articles and videos, explore small habits, and participate in community experiences.</p><p>Our Discord community gives members another place to connect and share perspectives.</p></section>
    <section><h2>Our co-founders</h2><FounderProfiles /></section>
    <section className="founder-biography" aria-labelledby="binh-welcome-title">
      <p className="eyebrow">A MESSAGE FROM OUR FOUNDER</p>
      <h2 id="binh-welcome-title">Welcome to Binexa Connect</h2>
      <h3>Binh Diep, Pharm.D., BCOP</h3>
      <p className="founder-role">Founder &amp; CEO</p>
      <p>Throughout my career as a pharmacist, I've had the privilege of caring for thousands of patients. With more than 25 years of experience in healthcare, I've learned that maintaining good health is not always easy. Many factors affect our health, including genetics, medical conditions, medications, stress, and lifestyle.</p>
      <p>One area that has always interested me is weight management. I've seen patients work incredibly hard to lose weight, only to become frustrated when they don't achieve the results they hoped for. Weight management is much more complex than simply eating less and exercising more, and everyone faces different challenges.</p>
      <p>Over the years, I've also developed a strong interest in preventive health, longevity, and healthy aging. I believe that living longer is important, but staying healthy and maintaining a good quality of life as we age is even more meaningful.</p>
      <p>This is why I created Binexa Connect.</p>
      <p>My goal is to build a community where people can learn, share experiences, ask questions, and discuss health topics that matter to them. There is so much health information available today, and it can be difficult to separate reliable information from misleading claims.</p>
      <p>As a pharmacist, I believe education plays an important role in helping people make informed decisions about their health.</p>
      <p>Through Binexa Connect, I plan to share articles and information about weight management, GLP-1 medications, nutrition, longevity, men's health, and general wellness. I also hope to learn from members through their experiences, questions, and discussions.</p>
      <p>I want this to be a welcoming community where everyone feels comfortable participating, whether you're looking for information, sharing an experience, or simply interested in learning something new.</p>
      <p>Thank you for being here. I look forward to connecting, learning, and growing together.</p>
    </section>
    <section className="founder-biography" aria-labelledby="rashmi-welcome-title">
      <p className="eyebrow">A MESSAGE FROM OUR CO-FOUNDER</p>
      <h2 id="rashmi-welcome-title">Welcome to Binexa Connect</h2>
      <h3>Rashmi Thimmaraju</h3>
      <p className="founder-role">Co-Founder, BinexaHealth</p>
      <p>With a Master's degree in Artificial Intelligence and 3 years of professional experience in technology, I've developed a strong interest in how AI can make a positive difference in people's lives.</p>
      <p>One area that has always interested me is the role of technology in healthcare. I believe AI has the potential to make health information easier to understand, improve access to educational resources, and help people make more informed decisions about their well-being.</p>
      <p>Over the years, I've also developed an interest in digital health, preventive wellness, and how technology can bring people together. I believe that while technology is important, having a supportive community where people can learn and share experiences is equally valuable.</p>
      <p>This is why I co-founded BinexaHealth with Binh Diep and helped create Binexa Connect.</p>
      <p>My goal is to build a community where people can explore new ideas, ask questions, share experiences, and learn about health and technology in a simple and welcoming environment.</p>
      <p>Through Binexa Connect, I plan to share articles and information about artificial intelligence in healthcare, emerging health technologies, wellness, and digital innovation. I also look forward to learning from members through their experiences, questions, and discussions.</p>
      <p>I want this to be a welcoming community where everyone feels comfortable participating, whether you're interested in learning something new, sharing an experience, or simply connecting with others.</p>
      <p>Thank you for being here. I look forward to connecting, learning, and growing together.</p>
      <p><strong>Rashmi Thimmaraju</strong><br /><em>Co-Founder, BinexaHealth</em></p>
    </section>
    <section><h2>Education and connection</h2><p>Binexa Connect’s community content is educational. It does not provide a diagnosis, individualized treatment, or a substitute for advice from a qualified healthcare professional.</p></section><Link href="/" className="textlink">Back to the community →</Link>
  </main>;
}
