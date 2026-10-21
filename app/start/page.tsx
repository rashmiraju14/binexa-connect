import PageHeader from "@/components/PageHeader";
import CommunityOnboarding from "@/components/CommunityOnboarding";
export default function Start() {
  return <main><PageHeader eyebrow="Welcome in" title="You don’t have to figure it all out alone." subtitle="Choose the topics that matter to you, explore at your own pace, and join the conversation when you’re ready."/><div className="shell pagecontent"><CommunityOnboarding/></div></main>;
}
