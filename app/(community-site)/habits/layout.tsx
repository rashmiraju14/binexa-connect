import { requireAccount } from "@/lib/auth/require-account";

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  await requireAccount("/habits");
  return <>{children}</>;
}
