import { requireAccount } from "@/lib/auth/require-account";

export default async function NewReleasesLayout({ children }: { children: React.ReactNode }) {
  await requireAccount("/research");
  return <>{children}</>;
}
