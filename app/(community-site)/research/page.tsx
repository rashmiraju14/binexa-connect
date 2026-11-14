import { requireAccount } from "@/lib/auth/require-account";
import PageHeader from "@/components/PageHeader";
import ResearchInsights from "@/components/ResearchInsights";

export const metadata = {
  title: "New Releases",
  alternates: { canonical: "/research" },
};

export default async function Research() {
  await requireAccount("/research");
  return <main>
    <PageHeader eyebrow="Explore the evidence" title="New Releases" subtitle="Explore the science behind better health." />
    <div className="shell pagecontent"><ResearchInsights /></div>
  </main>;
}
