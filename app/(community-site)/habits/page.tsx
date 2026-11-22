import BackToHome from "@/components/BackToHome";
export const metadata = { alternates: { canonical: "/habits" } };

import HabitPlanner from "@/components/HabitPlanner";
export default async function Habits() { return <main><div className="shell pagecontent"><BackToHome /><HabitPlanner/></div></main>; }
