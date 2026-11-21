import EventsMedia from "@/components/events/EventsMedia";

export const metadata = {
  title: "Events & Media",
  description: "Explore Binexa podcasts, community events, and moments from our journey.",
  alternates: { canonical: "/events" },
};

export default function Events() {
  return <EventsMedia />;
}
