import { requireAccount } from "@/lib/auth/require-account";
import PageHeader from "@/components/PageHeader";
import HabitPlanner from "@/components/HabitPlanner";
import CommunityInvitation from "@/components/CommunityInvitation";
export default async function Habits() { await requireAccount("/habits"); return <main><PageHeader eyebrow="Small habits" title="Build better habits with a community behind you." subtitle="Start with one manageable idea, notice what helps, and make room for real life."/><div className="shell pagecontent"><HabitPlanner/><CommunityInvitation/></div></main>; }
