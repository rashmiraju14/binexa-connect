import PodcastLibrary from "@/components/events/PodcastLibrary";

export const metadata = {
  title: "Healthcare Podcast Library",
  description: "Browse public healthcare and wellness podcasts from Cleveland Clinic, Mayo Clinic, and NEJM. Choose a topic and listen at your own pace.",
  alternates: { canonical: "/events/podcasts" },
};

export default function Podcasts() {
  return <PodcastLibrary />;
}
