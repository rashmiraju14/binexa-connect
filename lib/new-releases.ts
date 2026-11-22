import { learningItems } from "./learning";

export const releaseCategories = ["All Updates", "Weight Health", "Longevity", "Men's Health", "Preventive Health", "Healthcare Technology", "Skin Care"] as const;
export type ReleaseCategory = (typeof releaseCategories)[number];
export type NewRelease = {
  id: string;
  category: Exclude<ReleaseCategory, "All Updates">;
  title: string;
  summary: string;
  publisher: string;
  kind: string;
  published: string | null;
  dateLabel?: string;
  url: string;
  thumbnail?: { src: string; alt: string };
};

// Verified against the linked primary sources on November 15, 2026.
// Dates describe the linked publication, not indexing, verification, or study-completion dates.
export const curatedReleases: NewRelease[] = [
  {
    id: "fda-glp1-vision", category: "Weight Health",
    thumbnail: { src: "/images/new-releases/fda-glp1-vision.png", alt: "U.S. Food and Drug Administration" },
    title: "GLP-1 Medications and Vision: What the New FDA Warning Means",
    summary: "FDA is requiring labeling changes about a possible increased risk of NAION, a rare optic-nerve condition that can cause vision loss. This is a safety update, not a prediction of any one person's risk. FDA advises contacting a healthcare professional right away about sudden painless vision loss or other new visual symptoms; decisions about treatment need an individual review.",
    publisher: "U.S. Food and Drug Administration", kind: "Regulatory safety update",
    published: "2026-11-09",
    url: "https://www.fda.gov/drugs/drug-safety-communications/fda-requires-safety-labeling-changes-glucagon-peptide-1-receptor-agonists-glp-1-ras-due-potential",
  },
  {
    id: "glp1-lean-mass", category: "Weight Health",
    title: "Losing Weight Without Losing Strength: What GLP-1 Research Shows",
    summary: "A review pooling 20 randomized trials compared changes in lean tissue during incretin-based treatment and lifestyle programs. Both approaches involved lean-tissue loss alongside weight loss, while programs with resistance training had a more favorable profile. Lean mass is not the same as muscle strength, and these pooled findings cannot guarantee that an individual will preserve strength or muscle.",
    publisher: "Diabetes, Obesity and Metabolism · Wiley", kind: "Systematic review and meta-analysis",
    published: "2026-03-24", dateLabel: "Published online",
    url: "https://pubmed.ncbi.nlm.nih.gov/41877354/",
  },
  {
    id: "exercise-sleep-aging", category: "Longevity",
    title: "Can Exercise Help You Sleep Better as You Age?",
    summary: "A network meta-analysis compared exercise approaches across 32 randomized trials involving 2,658 older adults. Combined exercise ranked favorably for sleep quality, but results varied with the program and participants. The authors describe the conclusions as provisional and call for stronger studies; the review does not establish one best routine for everyone.",
    publisher: "European Geriatric Medicine · Springer", kind: "Systematic review and network meta-analysis",
    published: "2026-11-02", dateLabel: "Published online",
    url: "https://pubmed.ncbi.nlm.nih.gov/42970245/",
  },
  {
    id: "young-adult-heart-health", category: "Preventive Health",
    thumbnail: { src: "/images/new-releases/young-adult-heart-health.png", alt: "CKM Health Initiative patient handout" },
    title: "Heart Health in Your 20s: Why Prevention Starts Earlier Than You Think",
    summary: "An American Heart Association report describes a study of 1,283 young adults linking more advanced cardiovascular-kidney-metabolic risk with early signs of artery injury. The measurements were taken at one point in time, so they show associations rather than cause and effect. The findings may not represent all young adults and support further research into earlier prevention.",
    publisher: "American Heart Association Newsroom", kind: "Research news · Observational study",
    published: "2026-08-20",
    url: "https://newsroom.heart.org/news/study-found-artery-damage-in-adults-in-their-20s-highlighting-need-for-early-cardiovascular-risk-assessment",
  },
  {
    id: "sexual-cardiovascular-health", category: "Men's Health",
    title: "Men's Sexual Health and Heart Health: The Connection Worth Knowing",
    summary: "This review examines erectile dysfunction as a possible marker of wider blood-vessel disease and discusses approaches to cardiovascular risk assessment. It brings together existing evidence rather than reporting a new treatment trial. Erectile dysfunction has several possible causes; an association with heart health is a reason for a clinical conversation, not a diagnosis on its own.",
    publisher: "Canadian Journal of Urology · Tech Science Press", kind: "Review",
    published: "2026-08-21",
    url: "https://pubmed.ncbi.nlm.nih.gov/42682058/",
  },
  {
    id: "sleep-exercise-inflammation", category: "Longevity",
    title: "Could Better Sleep and Exercise Influence How We Age?",
    summary: "NIH describes research combining human activity and genetic data with experiments in mice. Links between lifestyle and inflammation related to altered blood cells depended on the mutation involved. The human findings were observational and the experiments were in animals, so this work does not prove that changing sleep or exercise slows human aging.",
    publisher: "NIH Research Matters", kind: "Research news · Human and animal study",
    published: "2026-07-14",
    url: "https://www.nih.gov/news-events/nih-research-matters/sleep-exercise-may-reduce-mutation-driven-inflammation",
  },
  {
    id: "diagnostic-safety-technology", category: "Healthcare Technology",
    title: "AI in Healthcare: Can Smarter Tools Make Diagnosis Safer?",
    summary: "NIH identifies diagnostic safety as a research priority, including work on AI-enabled tools, digital care, and communication across healthcare teams. This page describes questions researchers are encouraged to investigate. It is not a clinical study, an award announcement, or evidence that a particular AI tool makes diagnosis safer.",
    publisher: "National Institutes of Health · Grants & Funding", kind: "Research priority · Not a clinical study",
    published: "2026-07-28", dateLabel: "Posted",
    url: "https://grants.nih.gov/funding/find-a-fit-for-your-research/highlighted-topics/96",
  },
  {
    id: "lifes-essential-eight", category: "Preventive Health",
    title: "Eight Everyday Habits That Support Long-Term Heart Health",
    summary: "The American Heart Association's Life's Essential 8 combines four health behaviors with four health measures: eating, activity, tobacco exposure, sleep, weight, cholesterol, blood sugar, and blood pressure. This educational checklist offers a framework for discussing cardiovascular health. It is not a new research trial or a guarantee that healthy habits prevent every heart problem.",
    publisher: "American Heart Association", kind: "Educational resource",
    published: null,
    url: "https://www.heart.org/en/healthy-living/healthy-lifestyle/lifes-essential-8",
  },
];

// Keep the two previously published NIH selections and their original editorial text.
const previousDates: Record<string, string> = { "glp-research": "2026-05-12", "aging-research": "2024-10-15" };
const previousReleases: NewRelease[] = learningItems.filter(item => previousDates[item.id]).map(item => ({
  id: item.id, category: item.topic === "Weight health" ? "Weight Health" : "Longevity",
  title: item.title, summary: item.description, publisher: item.publisher,
  kind: "Research news", published: previousDates[item.id], url: item.url,
}));
export const newReleases = [...curatedReleases, ...previousReleases];

export function sortReleases<T extends { id: string; published: string | null }>(items: readonly T[]): T[] {
  return [...items].sort((a, b) => {
    if (a.id === "fda-glp1-vision") return b.id === a.id ? 0 : -1;
    if (b.id === "fda-glp1-vision") return 1;
    return (b.published || "").localeCompare(a.published || "");
  });
}

export function formatReleaseDate(date: string) {
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(date + "T00:00:00Z"));
}
