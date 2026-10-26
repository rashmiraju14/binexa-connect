import Image from "next/image";

const founders = [
  { name: "Binh Diep", role: "Founder & CEO", image: "binh-diep", description: "BinexaHealth & Binexa Connect Community", email: "Bdiep@binexahealth.com" },
  { name: "Rashmi Thimmaraju", role: "Technical Co-founder", image: "rashmi-thimmaraju", description: "BinexaHealth & Binexa Connect Community", email: "rashmi@binexahealth.com" },
];

export default function FounderProfiles() {
  return <div className="founder-grid">{founders.map(founder => <article className="founder-card" data-founder-bio={`${founder.image}-bio`} key={founder.image}>
    <div className={`founder-portrait founder-portrait-${founder.image}`}>
      <Image src={`/images/founders/${founder.image}.jpeg`} alt={founder.name} fill sizes="(max-width: 700px) calc(100vw - 40px), (max-width: 1000px) 45vw, 430px" />
    </div>
    <div className="founder-details"><h3><a className="founder-name-link" data-founder-bio={`${founder.image}-bio`} href={`/about#${founder.image}-bio`} aria-haspopup="dialog">{founder.name}</a></h3><p className="founder-role">{founder.role}</p><p>{founder.description}</p><a className="textlink" href={`mailto:${founder.email}`}>{founder.email}</a></div>
  </article>)}</div>;
}
