import { requireAccount } from "@/lib/auth/require-account";

export default async function DiscussionLayout({ children }: { children: React.ReactNode }) {
  await requireAccount("/discussions");
  return <>{children}</>;
}
