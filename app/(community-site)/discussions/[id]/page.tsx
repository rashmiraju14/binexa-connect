import { notFound } from 'next/navigation';
import { requireAccount } from '@/lib/auth/require-account';
import { uuidPattern } from '@/lib/discussions/shared';
import ThreadView from '@/components/discussions/ThreadView';
export const metadata = { title: 'Member Discussion', robots: { index: false, follow: false } };
export default async function DiscussionThread({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireAccount(`/discussions/${id}`);
  if (!uuidPattern.test(id)) notFound();
  return <main className="discussion-page"><div className="shell discussion-page-heading"><span className="eyebrow">The community corner</span><p>Thoughtful conversations. Shared perspectives. Members only.</p></div><ThreadView id={id} /></main>;
}
