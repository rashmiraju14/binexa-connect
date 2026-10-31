export const metadata = { alternates: { canonical: "/habits" } };

import { requireAccount } from "@/lib/auth/require-account";
import HabitPlanner from "@/components/HabitPlanner";
export default async function Habits() { await requireAccount("/habits"); return <main><div className="shell pagecontent"><HabitPlanner/></div></main>; }
