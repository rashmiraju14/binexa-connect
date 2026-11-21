import { audioEpisodes, audioShows, type AudioEpisode } from './events-podcasts';
import { additionalEpisodes, additionalShows } from './additional-podcasts';
import { podcastStreams } from './podcast-streams';
import { recommendedPodcasts, recommendedEpisodes } from './recommended-podcasts';

export type DiscoveryItem = {
  id: string; kind: 'audio' | 'show' | 'external'; title: string; description: string;
  publisher: string; seriesTitle: string; showId: string; category: string; topics: string[];
  published: string | null; durationSeconds: number | null; sourceUrl: string;
  recommended: boolean; audioEpisode?: AudioEpisode;
  youtubeUrl?: string; videoId?: string; accessNote?: string;
};
const normalizedTopics: Record<string, string> = { 'Weight health': 'Weight Management', 'Nutrition & digestion': 'Nutrition', 'Sleep & movement': 'Sleep & Wellness', 'AI & healthcare': 'AI & Healthcare' };
const showIdFor = (id: string) => id === 'cleveland' ? 'health-essentials' : id;
export const discoveryItems: DiscoveryItem[] = [
  ...recommendedPodcasts.map(show => ({ id: `show:${show.id}`, kind: 'show' as const, title: show.name, description: show.description, publisher: show.publisher, seriesTitle: show.name, showId: showIdFor(show.id), category: show.categories[0], topics: [...show.categories], published: null, durationSeconds: null, sourceUrl: show.url, recommended: true, youtubeUrl: show.youtubeUrl, accessNote: show.accessNote, audioEpisode: show.id === 'cleveland' ? audioEpisodes.find(episode => episode.showId === 'health-essentials') : podcastStreams[`show:${show.id}`] })),
  ...[...audioEpisodes, ...additionalEpisodes].map(episode => {
    const show = [...audioShows, ...additionalShows].find(show => show.id === episode.showId)!;
    return { id: `audio:${episode.id}`, kind: 'audio' as const, title: episode.title, description: episode.summary, publisher: show.publisher, seriesTitle: show.title, showId: show.id, category: episode.topic, topics: [normalizedTopics[episode.topic] || episode.topic], published: episode.published, durationSeconds: episode.durationSeconds, sourceUrl: episode.sourceUrl, recommended: false, audioEpisode: episode };
  }),
  ...recommendedEpisodes.map(episode => {
    const show = recommendedPodcasts.find(show => show.id === episode.podcastId)!;
    return { id: `external:${episode.id}`, kind: 'external' as const, title: episode.title, description: episode.summary, publisher: show.publisher, seriesTitle: show.name, showId: showIdFor(show.id), category: episode.category, topics: [episode.category], published: null, durationSeconds: null, sourceUrl: episode.url, recommended: false, videoId: episode.youtubeId, audioEpisode: episode.id === 'cleveland-weight' ? audioEpisodes.find(item => item.id === 'health-essentials-0') : podcastStreams[`external:${episode.id}`] };
  }),
];
export const discoveryTopics = ['All topics', 'Weight Management', 'Longevity', "Men's Health", 'Nutrition', 'Sleep & Wellness', 'AI & Healthcare', 'Everyday health', 'Clinical conversations', 'Healthcare & research'];
export const discoveryShows = [
  ...[...audioShows, ...additionalShows].map(show => ({ id: show.id, title: show.title })),
  ...recommendedPodcasts.filter(show => show.id !== 'cleveland').map(show => ({ id: show.id, title: show.name })),
];
export function findDiscoveryItems(query: string, topic = 'All topics', showId = 'all', order = 'newest') {
  const search = query.trim().toLocaleLowerCase();
  return discoveryItems.filter(item => (topic === 'All topics' || item.topics.includes(topic)) && (showId === 'all' || item.showId === showId) && (!search || `${item.title} ${item.description} ${item.publisher} ${item.seriesTitle} ${item.category}`.toLocaleLowerCase().includes(search))).sort((a, b) => {
    if (a.recommended !== b.recommended) return a.recommended ? -1 : 1;
    if (order === 'shortest') return (a.durationSeconds ?? Infinity) - (b.durationSeconds ?? Infinity);
    return (b.published || '').localeCompare(a.published || '');
  });
}
