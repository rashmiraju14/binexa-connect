import { requireAccount } from "@/lib/auth/require-account";

export default async function ArticleLayout({ children, params }: {
  children: React.ReactNode; params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  await requireAccount(`/resources/${encodeURIComponent(slug)}`);
  return <>{children}</>;
}
