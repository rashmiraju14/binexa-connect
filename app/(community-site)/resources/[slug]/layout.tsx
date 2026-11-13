import { isPublicArticle } from "@/lib/auth/navigation";
import { requireAccount } from "@/lib/auth/require-account";

export default async function ArticleLayout({ children, params }: {
  children: React.ReactNode; params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!isPublicArticle(slug)) await requireAccount(`/resources/${encodeURIComponent(slug)}`);
  return <>{children}</>;
}
