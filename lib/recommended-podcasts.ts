// Publisher destinations and selected episode pages checked November 21, 2026.
// No reusable artwork license was established. Use neutral text covers, never fabricated official artwork.
export const recommendedCategories = ["All Podcasts", "Weight Management", "Longevity", "Men's Health", "Nutrition", "Sleep & Wellness", "AI & Healthcare"] as const;
export type RecommendedCategory = (typeof recommendedCategories)[number];
export type PodcastTopic = Exclude<RecommendedCategory, "All Podcasts">;
export type RecommendedPodcast = {
  id: string; name: string; publisher: string; description: string;
  categories: PodcastTopic[]; url: string; youtubeUrl?: string; channelVerificationUrl?: string;
  initials: string; color: 'navy' | 'cream' | 'sage'; accessNote?: string;
};
export type RecommendedEpisode = {
  id: string; podcastId: string; title: string; summary: string; category: PodcastTopic;
  url: string; youtubeId?: string;
};
export const recommendedPodcasts: RecommendedPodcast[] = [
  { id: 'cleveland', name: 'Health Essentials', publisher: 'Cleveland Clinic', description: 'Conversations with Cleveland Clinic specialists about everyday health questions, nutrition, and wellbeing.', categories: ['Weight Management', 'Nutrition', 'Sleep & Wellness'], url: 'https://my.clevelandclinic.org/podcasts/health-essentials', initials: 'CC', color: 'navy' },
  { id: 'mayo-health', name: 'Mayo Clinic Health Matters', publisher: 'Mayo Clinic Press · Host: Kristen Meinzer', description: 'Curiosity-led conversations with Mayo Clinic experts about medical research and living well.', categories: ['Weight Management', 'Sleep & Wellness', 'Longevity'], url: 'https://podcasts.apple.com/us/podcast/mayo-clinic-health-matters/id1724209160', initials: 'MC', color: 'cream' },
  { id: 'stanford', name: 'Health Compass', publisher: 'Stanford Medicine · Host: Maya Adam, MD', description: 'Stories connecting medical discovery with everyday life, from health innovation to the people behind it.', categories: ['AI & Healthcare', 'Longevity', 'Sleep & Wellness'], url: 'https://med.stanford.edu/health-compass-podcast.html', youtubeUrl: 'https://www.youtube.com/@StanfordMedicine', channelVerificationUrl: 'https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=yR6v1WvjF6g&format=json', initials: 'SM', color: 'sage' },
  { id: 'attia', name: 'The Peter Attia Drive', publisher: 'Host: Peter Attia, MD', description: 'Long-form discussions about longevity, exercise, metabolic health, and the science of healthier aging.', categories: ['Longevity', 'Weight Management', 'Nutrition'], url: 'https://peterattiamd.com/Podcast/', youtubeUrl: 'https://www.youtube.com/@PeterAttiaMD', channelVerificationUrl: 'https://peterattiamd.com/Podcast/', initials: 'PA', color: 'cream', accessNote: 'Public episodes available; some publisher content requires membership.' },
  { id: 'zoe', name: 'ZOE Science & Nutrition', publisher: 'ZOE · Host: Jonathan Wolf', description: 'Researchers discuss food, gut health, and nutrition science through accessible, question-led conversations.', categories: ['Nutrition', 'Weight Management', 'Longevity'], url: 'https://podcasts.apple.com/us/podcast/zoe-science-nutrition/id1611216298', initials: 'Z', color: 'sage' },
  { id: 'huberman', name: 'Huberman Lab', publisher: 'Host: Andrew Huberman, PhD', description: 'Conversations exploring neuroscience, sleep, behavior, and the biology behind everyday wellbeing.', categories: ["Men's Health", 'Sleep & Wellness', 'Longevity'], url: 'https://www.hubermanlab.com/podcast', youtubeUrl: 'https://www.youtube.com/@hubermanlab', channelVerificationUrl: 'https://www.hubermanlab.com/podcast', initials: 'HL', color: 'navy' },
  { id: 'ama', name: 'AMA Update Podcast', publisher: 'American Medical Association', description: 'Physicians and health leaders discuss medical practice, public health, and changes in healthcare technology.', categories: ['AI & Healthcare', 'Sleep & Wellness'], url: 'https://www.ama-assn.org/series/ama-update-podcast', youtubeUrl: 'https://www.youtube.com/user/AmerMedicalAssn', channelVerificationUrl: 'https://www.ama-assn.org/series/ama-update-podcast', initials: 'AMA', color: 'cream' },
];
export const recommendedEpisodes: RecommendedEpisode[] = [
  { id: 'cleveland-weight', podcastId: 'cleveland', title: 'How ‘Set Point Theory’ Complicates Weight Loss', summary: 'A discussion of body-weight regulation and the challenges surrounding sustained weight change.', category: 'Weight Management', url: 'https://my.clevelandclinic.org/podcasts/health-essentials/how-set-point-theory-complicates-weight-loss' },
  { id: 'mayo-blood-pressure', podcastId: 'mayo-health', title: 'Taking charge of your blood pressure', summary: 'A conversation about cardiovascular health, blood-pressure monitoring, and questions to discuss with a care team.', category: 'Longevity', url: 'https://podcasts.apple.com/us/podcast/taking-charge-of-your-blood-pressure/id1724209160?i=1000800980889' },
  { id: 'stanford-ai', podcastId: 'stanford', title: 'AI & health care with Jonathan Chen and Michael Pfeffer', summary: 'An exploration of how artificial intelligence is being introduced into medical care.', category: 'AI & Healthcare', url: 'https://med.stanford.edu/health-compass-podcast/ai-health-care.html', youtubeId: 'XZlsjAVwaPI' },
  { id: 'attia-longevity', podcastId: 'attia', title: 'Longevity 101', summary: 'An introduction to Peter Attia’s framework for thinking about lifespan, healthspan, and prevention.', category: 'Longevity', url: 'https://peterattiamd.com/longevity101/' },
  { id: 'zoe-protein', podcastId: 'zoe', title: 'Protein, Exercise, and Healthy Aging', summary: 'A discussion of protein, physical activity, and questions about maintaining muscle with age.', category: 'Nutrition', url: 'https://zoe.com/learn/podcast-protein-and-exercise' },
  { id: 'huberman-sleep', podcastId: 'huberman', title: 'Sleep Toolkit: Tools for Optimizing Sleep & Sleep-Wake Timing', summary: 'An overview of circadian timing, everyday sleep behaviors, and the questions surrounding sleep routines.', category: 'Sleep & Wellness', url: 'https://www.hubermanlab.com/episode/sleep-toolkit-tools-for-optimizing-sleep-and-sleep-wake-timing' },
  { id: 'huberman-hormones', podcastId: 'huberman', title: 'The Science of How to Optimize Testosterone & Estrogen', summary: 'A conversation about sex hormones and their relationships with the brain, body, and behavior.', category: "Men's Health", url: 'https://www.hubermanlab.com/episode/the-science-of-how-to-optimize-testosterone-and-estrogen' },
  { id: 'ama-ai', podcastId: 'ama', title: 'Medical AI: Benefits of new technology and use case examples of AI in health care', summary: 'A discussion of medical-AI applications and the practical questions they raise for healthcare.', category: 'AI & Healthcare', url: 'https://www.ama-assn.org/practice-management/digital-health/medical-ai-benefits-new-technology-and-use-case-examples-ai-0' },
];
export const recommendedDisclaimer = 'These independently produced podcasts are curated for educational purposes. Their inclusion does not imply affiliation, partnership, or endorsement. Content is not a substitute for professional medical advice.';

export function filterRecommendedPodcasts(category: RecommendedCategory) {
  return recommendedPodcasts.filter(podcast => category === 'All Podcasts' || podcast.categories.includes(category));
}
export function filterRecommendedEpisodes(category: RecommendedCategory) {
  return recommendedEpisodes.filter(episode => category === 'All Podcasts' || episode.category === category);
}
