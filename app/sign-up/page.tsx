import { redirect } from "next/navigation";
import { safeNextPath } from "@/lib/auth/navigation";

export default async function AuthEntry({ searchParams }: {
  searchParams: Promise<{ next?: string; verification?: string }>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams({ auth: "sign-up", next: safeNextPath(params.next) });
  if (params.verification === "failed") query.set("verification", "failed");
  redirect(`/?${query}`);
}
