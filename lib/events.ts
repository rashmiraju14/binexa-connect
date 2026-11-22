// Add only verified, official Binexa destinations and media here.
export type EditorialImage = { src: string; alt: string };
export type EventVideo = { youtubeId?: string; src?: string; poster?: string };
export type PodcastEpisode = {
  id: string; title: string; description: string; videoId: string;
  thumbnail?: EditorialImage; published?: string; duration?: string;
};
export type GalleryMedia = {
  id: string; kind: 'image' | 'video'; src?: string; video?: EventVideo;
  caption: string; category: string; date?: string;
};
export type PastEvent = {
  id: string; name: string; date: string; category: string; status: 'Past Event';
  description: string; cover: EditorialImage | null; gallery: GalleryMedia[]; recap: EventVideo | null;
};
export type UpcomingEvent = {
  id: string; title: string; description: string; category: string; image: EditorialImage;
  date: string | null; registrationUrl: string | null; status: 'Coming Soon';
};
export const youtube: {
  channelUrl: string; playlistUrl: string; subscribeUrl: string;
  featuredEpisode: PodcastEpisode | null; episodes: PodcastEpisode[];
} = { channelUrl: 'https://www.youtube.com/channel/UCB4lTIYKyfqgbPA06Ia6wVw', playlistUrl: '', subscribeUrl: '', featuredEpisode: null, episodes: [] };

export const editorialImages = {
  youtubeHighlights: { src: "/images/events/youtube-highlights.webp", alt: "A warmly lit podcast studio with comfortable chairs and conversation microphones" },
  hero: { src: '/images/events/events-hero.webp', alt: 'Navy upholstered podcast chairs and microphones with warm pendant lighting' },
  studio: { src: '/images/events/podcast-studio.webp', alt: 'A microphone and headphones in a warmly lit podcast studio' },
  topic: { src: '/images/events/podcast-topic.webp', alt: 'Microphone, headphones, notebook, and coffee on a sunlit desk' },
};
export const pastEvents: PastEvent[] = [{
  id: 'pre-launch-2026', name: 'Binexa Health — Pre-Launch Event', date: '2026-11-20',
  category: 'Community Event', status: 'Past Event',
  description: 'A special milestone in the Binexa journey as we continue building a community centered around personalized healthcare, wellness education, and meaningful connections.',
  cover: { src: '/images/events/pre-launch/photo-17.webp', alt: "Community group photo with Binexa pre-launch flyers" },
  gallery: [
    { id: 'pre-launch-photo-1', kind: 'image', src: '/images/events/pre-launch/photo-01.webp', caption: "Guests listening to a presentation at the Binexa pre-launch event", category: 'Pre-Launch Event' },
    { id: 'pre-launch-photo-2', kind: 'image', src: '/images/events/pre-launch/photo-02.webp', caption: "Audience questions during the community conversation", category: 'Pre-Launch Event' },
    { id: 'pre-launch-photo-3', kind: 'image', src: '/images/events/pre-launch/photo-03.webp', caption: "Attendees taking part in the discussion", category: 'Pre-Launch Event' },
    { id: 'pre-launch-photo-4', kind: 'image', src: '/images/events/pre-launch/photo-04.webp', caption: "Presenters speaking with the seated audience", category: 'Pre-Launch Event' },
    { id: 'pre-launch-photo-5', kind: 'image', src: '/images/events/pre-launch/photo-05.webp', caption: "Community members gathered in front of the Binexa website display", category: 'Pre-Launch Event' },
    { id: 'pre-launch-photo-6', kind: 'image', src: '/images/events/pre-launch/photo-06.webp', caption: "A group portrait beside the Binexa presentation", category: 'Pre-Launch Event' },
    { id: 'pre-launch-photo-7', kind: 'image', src: '/images/events/pre-launch/photo-07.webp', caption: "Guests connecting over refreshments", category: 'Pre-Launch Event' },
    { id: 'pre-launch-photo-8', kind: 'image', src: '/images/events/pre-launch/photo-08.webp', caption: "Presenters introducing Binexa Health", category: 'Pre-Launch Event' },
    { id: 'pre-launch-photo-9', kind: 'image', src: '/images/events/pre-launch/photo-09.webp', caption: "Guests exploring the Binexa Health presentation", category: 'Pre-Launch Event' },
    { id: 'pre-launch-photo-10', kind: 'image', src: '/images/events/pre-launch/photo-10.webp', caption: "The Binexa Health website on the event display", category: 'Pre-Launch Event' },
    { id: 'pre-launch-photo-11', kind: 'image', src: '/images/events/pre-launch/photo-11.webp', caption: "Pre-launch event flyers ready for guests", category: 'Pre-Launch Event' },
    { id: 'pre-launch-photo-12', kind: 'image', src: '/images/events/pre-launch/photo-12.webp', caption: "Printed invitations for the Binexa pre-launch event", category: 'Pre-Launch Event' },
    { id: 'pre-launch-photo-13', kind: 'image', src: '/images/events/pre-launch/photo-13.webp', caption: "The community quiz wheel and presentation equipment", category: 'Pre-Launch Event' },
    { id: 'pre-launch-photo-14', kind: 'image', src: '/images/events/pre-launch/photo-14.webp', caption: "The decorated event space before guests arrived", category: 'Pre-Launch Event' },
    { id: 'pre-launch-photo-15', kind: 'image', src: '/images/events/pre-launch/photo-15.webp', caption: "Refreshments prepared for the community gathering", category: 'Pre-Launch Event' },
    { id: 'pre-launch-photo-16', kind: 'image', src: '/images/events/pre-launch/photo-16.webp', caption: "Seating arranged for the pre-launch event", category: 'Pre-Launch Event' },
    { id: 'pre-launch-photo-17', kind: 'image', src: '/images/events/pre-launch/photo-17.webp', caption: "Community group photo with Binexa pre-launch flyers", category: 'Pre-Launch Event' },
    { id: 'pre-launch-photo-18', kind: 'image', src: '/images/events/pre-launch/photo-18.webp', caption: "Guests celebrating together with their event flyers", category: 'Pre-Launch Event' },
    { id: 'pre-launch-photo-19', kind: 'image', src: '/images/events/pre-launch/photo-19.webp', caption: "A shared community moment at the Binexa pre-launch event", category: 'Pre-Launch Event' },
  ], recap: null,
}];
export const upcomingEvents: UpcomingEvent[] = [
  { id: 'webinars', title: 'Wellness Webinars', category: 'Wellness education', description: 'Explore educational conversations about healthy habits, weight management, and everyday wellness.', image: { src: '/images/events/wellness-webinar.webp', alt: 'Healthcare professional speaking on a video call from a bright workspace' }, date: null, registrationUrl: null, status: 'Coming Soon' },
  { id: 'conversations', title: 'Expert Conversations', category: 'Ideas & innovation', description: 'Explore informative discussions about healthcare, medical research, and innovations in wellness.', image: { src: '/images/events/expert-conversation.webp', alt: 'Two people recording a conversation at a table with microphones and headphones' }, date: null, registrationUrl: null, status: 'Coming Soon' },
  { id: 'meetups', title: 'Community Meetups', category: 'Community connection', description: 'Connect with people interested in wellness, healthier lifestyles, and meaningful community conversations.', image: { src: '/images/events/community-meetup.webp', alt: 'A friendly small-group conversation in a comfortable community setting' }, date: null, registrationUrl: null, status: 'Coming Soon' },
  { id: 'workshops', title: 'Educational Workshops', category: 'Everyday learning', description: 'Learn practical approaches to building healthier everyday habits and understanding wellness information.', image: { src: '/images/events/educational-workshop.webp', alt: 'Workshop participants listening and taking notes in a bright room' }, date: null, registrationUrl: null, status: 'Coming Soon' },
];
// Real company media only. Add files in public/images/events/binexa-moments/.
export const binexaMoments: GalleryMedia[] = [];
export const suggestedTopics = ['Healthy everyday habits', 'Weight management education', 'Sleep and longevity', 'Nutrition and wellness', "Men’s health", 'AI and healthcare', 'Community wellness questions'];

export function youtubeDestination(value: string): string | null {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && ['www.youtube.com', 'youtube.com', 'youtu.be'].includes(url.hostname) && !url.username && !url.password ? url.href : null;
  } catch { return null; }
}
export function youtubeVideoId(value?: string): value is string { return Boolean(value && /^[a-zA-Z0-9_-]{11}$/.test(value)); }
export function localMediaPath(value?: string): value is string { return Boolean(value && /^\/images\/events\/[a-zA-Z0-9_./-]+$/.test(value) && !value.includes('..')); }
export function hasVideo(video?: EventVideo | null) { return Boolean(video && (youtubeVideoId(video.youtubeId) || localMediaPath(video.src))); }
export function displayEventDate(date: string) { return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`)); }
