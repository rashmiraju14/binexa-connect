// Curated from the publishers' public RSS feeds on November 21, 2026.
// Titles, dates, durations, and audio URLs come from those feeds; summaries are original.
// Audio streams directly from the publisher's host and is never copied to Binexa.
export type AudioShow = { id: string; title: string; publisher: string; url: string; feedUrl: string; topic: string };
export type AudioEpisode = { id: string; showId: string; title: string; summary: string; topic: string; published: string; durationSeconds: number | null; audioUrl: string; sourceUrl: string };
export const podcastVerifiedOn = "2026-11-21";
export const audioShows: AudioShow[] = [
  {
    "id": "health-essentials",
    "title": "Health Essentials",
    "publisher": "Cleveland Clinic",
    "url": "https://my.clevelandclinic.org/podcasts/health-essentials",
    "feedUrl": "https://feeds.megaphone.fm/IAIIL7971610262",
    "topic": "Everyday health"
  },
  {
    "id": "butts-guts",
    "title": "Butts & Guts",
    "publisher": "Cleveland Clinic",
    "url": "https://my.clevelandclinic.org/podcasts/butts-and-guts",
    "feedUrl": "https://rss.buzzsprout.com/2246824.rss",
    "topic": "Nutrition & digestion"
  },
  {
    "id": "mayo-talks",
    "title": "Mayo Clinic Talks",
    "publisher": "Mayo Clinic",
    "url": "https://ce.mayo.edu/online-education/content/mayo-clinic-talks",
    "feedUrl": "https://feed.podbean.com/mayoclinictalks/feed.xml",
    "topic": "Clinical conversations"
  },
  {
    "id": "nejm-interviews",
    "title": "NEJM Interviews",
    "publisher": "NEJM Group",
    "url": "https://www.nejm.org/multimedia/audio-interview",
    "feedUrl": "https://podcast.nejm.org/nejm_audio_interview.xml",
    "topic": "Healthcare & research"
  },
  {
    "id": "ai-grand-rounds",
    "title": "AI Grand Rounds",
    "publisher": "NEJM AI",
    "url": "https://ai-podcast.nejm.org/",
    "feedUrl": "https://ai-podcast.nejm.org/feed.xml",
    "topic": "AI & healthcare"
  }
];

export const audioEpisodes: AudioEpisode[] = [
  {
    "id": "health-essentials-0",
    "showId": "health-essentials",
    "title": "How ‘Set Point Theory’ Complicates Weight Loss",
    "summary": "A discussion of body-weight regulation and why sustained weight change can be complicated.",
    "topic": "Weight health",
    "published": "2026-11-18",
    "durationSeconds": 2309,
    "audioUrl": "https://traffic.megaphone.fm/IAIIL4023937460.mp3",
    "sourceUrl": "https://my.clevelandclinic.org/podcasts/health-essentials"
  },
  {
    "id": "health-essentials-1",
    "showId": "health-essentials",
    "title": "Nutrition Essentials: Can You Eat Too Much Protein?",
    "summary": "A dietitian explores protein intake and questions raised by high-protein eating trends.",
    "topic": "Nutrition & digestion",
    "published": "2026-11-11",
    "durationSeconds": 1869,
    "audioUrl": "https://traffic.megaphone.fm/IAIIL8259198963.mp3",
    "sourceUrl": "https://my.clevelandclinic.org/podcasts/health-essentials"
  },
  {
    "id": "health-essentials-2",
    "showId": "health-essentials",
    "title": "Sports Essentials: Functional Movement Screenings",
    "summary": "An introduction to movement assessments and how they are used in sports performance.",
    "topic": "Sleep & movement",
    "published": "2026-11-09",
    "durationSeconds": 3963,
    "audioUrl": "https://traffic.megaphone.fm/IAIIL5200692213.mp3",
    "sourceUrl": "https://my.clevelandclinic.org/podcasts/health-essentials"
  },
  {
    "id": "health-essentials-4",
    "showId": "health-essentials",
    "title": "Do Our Eyes Grow as We Age?",
    "summary": "A conversation about changes in eye size during childhood and adulthood.",
    "topic": "Everyday health",
    "published": "2026-10-28",
    "durationSeconds": 1201,
    "audioUrl": "https://traffic.megaphone.fm/IAIIL8825570451.mp3",
    "sourceUrl": "https://my.clevelandclinic.org/podcasts/health-essentials"
  },
  {
    "id": "health-essentials-20",
    "showId": "health-essentials",
    "title": "Can Wearing Socks Help You Sleep Better? with Dr. Aparna Bhat, MD",
    "summary": "A sleep specialist considers the relationship between warm feet and falling asleep.",
    "topic": "Sleep & movement",
    "published": "2026-07-29",
    "durationSeconds": 734,
    "audioUrl": "https://traffic.megaphone.fm/IAIIL6124379509.mp3",
    "sourceUrl": "https://my.clevelandclinic.org/podcasts/health-essentials"
  },
  {
    "id": "health-essentials-26",
    "showId": "health-essentials",
    "title": "Sleep Apnea 101: Symptoms, Risks & Solutions with Aparna Bhat, MD",
    "summary": "An overview of sleep apnea, its symptoms, and the questions people bring to clinicians.",
    "topic": "Sleep & movement",
    "published": "2026-06-24",
    "durationSeconds": 1973,
    "audioUrl": "https://traffic.megaphone.fm/IAIIL1170837987.mp3",
    "sourceUrl": "https://my.clevelandclinic.org/podcasts/health-essentials"
  },
  {
    "id": "butts-guts-1",
    "showId": "butts-guts",
    "title": "What Causes Bowel Leakage? Understanding Fecal Incontinence and the Latest Treatment Options",
    "summary": "A colorectal specialist discusses bowel-control concerns and approaches used in clinical care.",
    "topic": "Nutrition & digestion",
    "published": "2026-11-10",
    "durationSeconds": 690,
    "audioUrl": "https://www.buzzsprout.com/2246824/episodes/20079164-what-causes-bowel-leakage-understanding-fecal-incontinence-and-the-latest-treatment-options.mp3",
    "sourceUrl": "https://my.clevelandclinic.org/podcasts/butts-and-guts"
  },
  {
    "id": "butts-guts-2",
    "showId": "butts-guts",
    "title": "Weight Loss Without Surgery? Understanding Bariatric Endoscopy",
    "summary": "A discussion of endoscopic weight-management procedures and the assessment involved before treatment.",
    "topic": "Weight health",
    "published": "2026-10-27",
    "durationSeconds": 1080,
    "audioUrl": "https://www.buzzsprout.com/2246824/episodes/20008119-weight-loss-without-surgery-understanding-bariatric-endoscopy.mp3",
    "sourceUrl": "https://my.clevelandclinic.org/podcasts/butts-and-guts"
  },
  {
    "id": "butts-guts-3",
    "showId": "butts-guts",
    "title": "Inguinal Hernias: From Groin Pain to Hernia Repair",
    "summary": "An introduction to inguinal hernia symptoms, evaluation, and repair options.",
    "topic": "Nutrition & digestion",
    "published": "2026-10-14",
    "durationSeconds": 1186,
    "audioUrl": "https://www.buzzsprout.com/2246824/episodes/19959263-inguinal-hernias-from-groin-pain-to-hernia-repair.mp3",
    "sourceUrl": "https://my.clevelandclinic.org/podcasts/butts-and-guts"
  },
  {
    "id": "butts-guts-4",
    "showId": "butts-guts",
    "title": "Reducing Your Risk of Pancreatic Cancer",
    "summary": "A conversation about pancreatic cancer risk factors and questions surrounding screening.",
    "topic": "Nutrition & digestion",
    "published": "2026-09-29",
    "durationSeconds": 862,
    "audioUrl": "https://www.buzzsprout.com/2246824/episodes/19858422-reducing-your-risk-of-pancreatic-cancer.mp3",
    "sourceUrl": "https://my.clevelandclinic.org/podcasts/butts-and-guts"
  },
  {
    "id": "butts-guts-5",
    "showId": "butts-guts",
    "title": "Constipation: What's Normal and When Should You Be Concerned?",
    "summary": "A gastroenterologist explores constipation, bowel habits, and when further assessment may be useful.",
    "topic": "Nutrition & digestion",
    "published": "2026-09-15",
    "durationSeconds": 1100,
    "audioUrl": "https://www.buzzsprout.com/2246824/episodes/19789747-constipation-what-s-normal-and-when-should-you-be-concerned.mp3",
    "sourceUrl": "https://my.clevelandclinic.org/podcasts/butts-and-guts"
  },
  {
    "id": "butts-guts-6",
    "showId": "butts-guts",
    "title": "Pelvic Floor Disorders: Symptoms, Causes and Treatment Options",
    "summary": "A discussion of pelvic-floor symptoms and multidisciplinary approaches to evaluation and treatment.",
    "topic": "Nutrition & digestion",
    "published": "2026-09-01",
    "durationSeconds": 1235,
    "audioUrl": "https://www.buzzsprout.com/2246824/episodes/19716165-pelvic-floor-disorders-symptoms-causes-and-treatment-options.mp3",
    "sourceUrl": "https://my.clevelandclinic.org/podcasts/butts-and-guts"
  },
  {
    "id": "mayo-talks-0",
    "showId": "mayo-talks",
    "title": "Detection and Management of Scoliosis",
    "summary": "A clinician-focused discussion of identifying spinal curvature and decisions about referral and follow-up.",
    "topic": "Clinical conversations",
    "published": "2026-11-17",
    "durationSeconds": 1369,
    "audioUrl": "https://mcdn.podbean.com/mf/web/cc6ech9u989fjxk7/WF10201303_Correcting_Curvature_-_Scoliosis6o0bn.mp3",
    "sourceUrl": "https://mayoclinictalks.podbean.com/e/detection-and-management-of-scoliosis/"
  },
  {
    "id": "mayo-talks-1",
    "showId": "mayo-talks",
    "title": "Carpal Tunnel Syndrome",
    "summary": "A clinical conversation about wrist nerve compression, evaluation, and treatment considerations.",
    "topic": "Clinical conversations",
    "published": "2026-11-10",
    "durationSeconds": 889,
    "audioUrl": "https://mcdn.podbean.com/mf/web/brg4363abuens6ny/WF9934800_Carpel_Tunnel_Syndrome8wbae.mp3",
    "sourceUrl": "https://mayoclinictalks.podbean.com/e/carpal-tunnel-syndrome/"
  },
  {
    "id": "mayo-talks-3",
    "showId": "mayo-talks",
    "title": "Hearing Loss and Cochlear Implants",
    "summary": "A clinician-focused overview of hearing assessment and cochlear implant care.",
    "topic": "Clinical conversations",
    "published": "2026-10-27",
    "durationSeconds": 1788,
    "audioUrl": "https://mcdn.podbean.com/mf/web/cabbupa5h976hcbm/WF9557668_Hearing_Loss_and_Cochlear_Implants67mtx.mp3",
    "sourceUrl": "https://mayoclinictalks.podbean.com/e/hearing-loss-and-cochlear-implants/"
  },
  {
    "id": "mayo-talks-6",
    "showId": "mayo-talks",
    "title": "Strabismus: Symptoms, Causes & Treatment",
    "summary": "A clinical discussion of eye misalignment, recognition, and care pathways.",
    "topic": "Clinical conversations",
    "published": "2026-09-29",
    "durationSeconds": 1818,
    "audioUrl": "https://mcdn.podbean.com/mf/web/7sk5tizuts8x66m8/WF11211247_Strabismus.mp3",
    "sourceUrl": "https://mayoclinictalks.podbean.com/e/strabismus-symptoms-causes-treatment/"
  },
  {
    "id": "mayo-talks-7",
    "showId": "mayo-talks",
    "title": "Sinus Disease and Allergies",
    "summary": "A conversation about distinguishing sinus problems from allergies in primary care.",
    "topic": "Clinical conversations",
    "published": "2026-09-22",
    "durationSeconds": 1692,
    "audioUrl": "https://mcdn.podbean.com/mf/web/dgv86qqy7fsap56k/WF10054877_Sinus_Disease_and_Allergy9r58l.mp3",
    "sourceUrl": "https://mayoclinictalks.podbean.com/e/sinus-disease-and-allergies/"
  },
  {
    "id": "mayo-talks-8",
    "showId": "mayo-talks",
    "title": "An Update on Glaucoma",
    "summary": "A clinician-focused discussion of glaucoma recognition and its relationship to primary care.",
    "topic": "Clinical conversations",
    "published": "2026-09-15",
    "durationSeconds": 1344,
    "audioUrl": "https://mcdn.podbean.com/mf/web/7xztxr3uvmin6kdt/WF10731932_Update_on_Glaucomaa82oq.mp3",
    "sourceUrl": "https://mayoclinictalks.podbean.com/e/an-update-on-glaucoma/"
  },
  {
    "id": "nejm-interviews-0",
    "showId": "nejm-interviews",
    "title": "NEJM Interview: Beth McGinty on the importance of producing and disseminating rigorous evidence about health policy options and their trade-offs.",
    "summary": "A conversation about developing and sharing evidence to inform health-policy decisions.",
    "topic": "Healthcare & research",
    "published": "2026-11-18",
    "durationSeconds": 656,
    "audioUrl": "https://podcast.nejm.org/interviews/NEJMdo008805.mp3",
    "sourceUrl": "https://www.nejm.org/doi/full/10.1056/NEJMp2611665"
  },
  {
    "id": "nejm-interviews-1",
    "showId": "nejm-interviews",
    "title": "NEJM Interview: Nicholas Peoples on mass surveillance enabled by artificial intelligence and its potential effects on population health.",
    "summary": "A discussion of AI-enabled surveillance and questions about population health.",
    "topic": "Healthcare & research",
    "published": "2026-11-11",
    "durationSeconds": 1417,
    "audioUrl": "https://podcast.nejm.org/interviews/NEJMdo008800.mp3",
    "sourceUrl": "https://www.nejm.org/doi/full/10.1056/NEJMp2611224"
  },
  {
    "id": "nejm-interviews-2",
    "showId": "nejm-interviews",
    "title": "NEJM Interview: Irene Papanicolas on the role of profit in the U.S. health insurance sector and policy lessons from other countries.",
    "summary": "An interview about insurance-sector incentives and comparisons between healthcare systems.",
    "topic": "Healthcare & research",
    "published": "2026-11-04",
    "durationSeconds": 549,
    "audioUrl": "https://podcast.nejm.org/interviews/NEJMdo008771.mp3",
    "sourceUrl": "https://www.nejm.org/doi/full/10.1056/NEJMp2611270"
  },
  {
    "id": "nejm-interviews-3",
    "showId": "nejm-interviews",
    "title": "NEJM Interview: Anjali Deshmukh on legal challenges to fines issued by federal agencies.",
    "summary": "A discussion of legal questions affecting enforcement by federal health agencies.",
    "topic": "Healthcare & research",
    "published": "2026-10-28",
    "durationSeconds": 869,
    "audioUrl": "https://podcast.nejm.org/interviews/NEJMdo008770.mp3",
    "sourceUrl": "https://www.nejm.org/doi/full/10.1056/NEJMp2609972"
  },
  {
    "id": "nejm-interviews-4",
    "showId": "nejm-interviews",
    "title": "NEJM Interview: Matthew Vogel on the emergence of clinical trial prediction markets.",
    "summary": "An introduction to prediction markets involving clinical trials and their implications.",
    "topic": "Healthcare & research",
    "published": "2026-10-21",
    "durationSeconds": 449,
    "audioUrl": "https://podcast.nejm.org/interviews/NEJMdo008761.mp3",
    "sourceUrl": "https://www.nejm.org/doi/full/10.1056/NEJMp2610547"
  },
  {
    "id": "nejm-interviews-5",
    "showId": "nejm-interviews",
    "title": "NEJM Interview: Lena Makaroun on opportunities for clinicians to address firearm-related risks with their older patients.",
    "summary": "A conversation about addressing firearm-related risks in care for older adults.",
    "topic": "Healthcare & research",
    "published": "2026-10-14",
    "durationSeconds": 829,
    "audioUrl": "https://podcast.nejm.org/interviews/NEJMdo008758.mp3",
    "sourceUrl": "https://www.nejm.org/doi/full/10.1056/NEJMp2608481"
  },
  {
    "id": "ai-grand-rounds-0",
    "showId": "ai-grand-rounds",
    "title": "Hippocratic AI’s Munjal Shah on Building Safe AI",
    "summary": "A conversation about voice-based health agents, testing, and the boundaries of clinical AI.",
    "topic": "AI & healthcare",
    "published": "2026-11-18",
    "durationSeconds": 4575,
    "audioUrl": "https://mcdn.podbean.com/mf/web/96t65cbehknhgbn4/Episodes_48_Shah.mp3",
    "sourceUrl": "https://ai-podcast.nejm.org/e/hippocratic-ai-s-munjal-shah-on-building-safe-ai/"
  },
  {
    "id": "ai-grand-rounds-1",
    "showId": "ai-grand-rounds",
    "title": "Abridge’s Dr. Michal Nedoszytko on Physicians Who Build Software",
    "summary": "A physician discusses building software and the relationship between clinical experience and technology design.",
    "topic": "AI & healthcare",
    "published": "2026-10-21",
    "durationSeconds": 3395,
    "audioUrl": "https://mcdn.podbean.com/mf/web/45fep7yg5evwef2t/Episode_47_Nedoszytko.mp3",
    "sourceUrl": "https://ai-podcast.nejm.org/e/abridge-s-dr-michal-nedoszytko-on-physicians-who-build-software/"
  },
  {
    "id": "ai-grand-rounds-2",
    "showId": "ai-grand-rounds",
    "title": "Beyond the Hype: Dr. Xiao Liu on Evaluating Medical AI",
    "summary": "A discussion of medical-AI evaluation, reporting, and the evidence needed for clinical use.",
    "topic": "AI & healthcare",
    "published": "2026-09-16",
    "durationSeconds": 2630,
    "audioUrl": "https://mcdn.podbean.com/mf/web/ap6u6wvzq8uuc8jz/Episode_46_Liu.mp3",
    "sourceUrl": "https://ai-podcast.nejm.org/e/beyond-the-hype-dr-xiao-liu-on-evaluating-medical-ai/"
  },
  {
    "id": "ai-grand-rounds-3",
    "showId": "ai-grand-rounds",
    "title": "Dr. Suchi Saria on Building AI That Changes Care",
    "summary": "A conversation about moving clinical AI from retrospective models into real care workflows.",
    "topic": "AI & healthcare",
    "published": "2026-08-19",
    "durationSeconds": 3544,
    "audioUrl": "https://mcdn.podbean.com/mf/web/axwp7ybbg4raggg3/Episode_45_Saria.mp3",
    "sourceUrl": "https://ai-podcast.nejm.org/e/dr-suchi-saria-on-building-ai-that-changes-care/"
  },
  {
    "id": "ai-grand-rounds-4",
    "showId": "ai-grand-rounds",
    "title": "Weave’s Brandon Rice on Rebuilding Drug Regulation with AI",
    "summary": "A discussion of organizing scientific evidence and using AI in medicines regulation.",
    "topic": "AI & healthcare",
    "published": "2026-07-15",
    "durationSeconds": 2704,
    "audioUrl": "https://mcdn.podbean.com/mf/web/gmq6ug559rwx6hiq/Episode_44_Rice.mp3",
    "sourceUrl": "https://ai-podcast.nejm.org/e/weave-s-brandon-rice-on-rebuilding-drug-regulation-with-ai/"
  },
  {
    "id": "ai-grand-rounds-5",
    "showId": "ai-grand-rounds",
    "title": "OpenAI’s Karan Singal on HealthBench and the Future of Medical AI",
    "summary": "A conversation about evaluating health-language models and how people use medical AI.",
    "topic": "AI & healthcare",
    "published": "2026-06-17",
    "durationSeconds": 2744,
    "audioUrl": "https://mcdn.podbean.com/mf/web/sa3fvjgqx662w4i3/Episode_43_Singhal.mp3",
    "sourceUrl": "https://ai-podcast.nejm.org/e/openai-s-karan-singal-on-healthbench-and-the-future-of-medical-ai/"
  }
];

export const audioTopics = ["All topics", ...Array.from(new Set(audioEpisodes.map(episode => episode.topic)))];
export function findAudioEpisodes(query: string, topic = "All topics", showId = "all", order = "newest") {
  const search = query.trim().toLocaleLowerCase();
  return audioEpisodes.filter(episode => {
    const show = audioShows.find(show => show.id === episode.showId);
    return (topic === "All topics" || episode.topic === topic)
      && (showId === "all" || episode.showId === showId)
      && (!search || `${episode.title} ${episode.summary} ${episode.topic} ${show?.title} ${show?.publisher}`.toLocaleLowerCase().includes(search));
  }).sort((a, b) => order === "shortest" ? (a.durationSeconds ?? Infinity) - (b.durationSeconds ?? Infinity) : b.published.localeCompare(a.published));
}
export function audioDuration(seconds: number | null) { return seconds === null ? null : `${Math.ceil(seconds / 60)} min`; }
export function audioDate(date: string) { return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`)); }
