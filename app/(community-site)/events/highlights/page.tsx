import EventHighlights from "@/components/events/EventHighlights";

export const metadata = {
  title: "Event Highlights & Photos",
  description: "Explore real Binexa event photos, community moments, and video highlights.",
  alternates: { canonical: "/events/highlights" },
};

export default function Highlights() {
  return <EventHighlights />;
}
