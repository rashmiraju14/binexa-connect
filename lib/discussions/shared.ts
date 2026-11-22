export const categories = [
  'General Community', 'Weight Management', 'GLP-1 Education', 'Longevity & Wellness',
  "Men's Health", 'Healthcare & Research', 'AI & Healthcare', 'Questions & Suggestions', 'Binexa Announcements',
] as const;
export const guidelines = [
  'Treat every community member with respect.',
  'Share educational information responsibly.',
  'Do not provide personalized medical diagnoses or prescriptions.',
  'Do not promote unsafe medications or unverified treatments.',
  'Do not buy, sell, or exchange prescription medications through the Discussion Board.',
  'Do not share private medical records or sensitive personal information.',
  'Do not publish spam, harassment, or misleading health claims.',
  'Consult qualified healthcare professionals for personal medical concerns.',
];
export const disclaimer = "Binexa Connect is an educational community. Discussions reflect individual members' perspectives and are not a substitute for professional medical advice, diagnosis, or treatment.";
export type Profile = { id: string; display_name: string; avatar_url: string | null; created_at: string; is_admin: boolean };
export type Post = { id: string; author_id: string; title: string; content: string; category: string; created_at: string; updated_at: string; pinned: boolean; locked: boolean; status: string; author: Profile; reply_count: number; reaction_count: number; liked: boolean };
export type Reply = { id: string; discussion_id: string; author_id: string; parent_id: string | null; content: string; created_at: string; updated_at: string; status: string; author: Profile; reaction_count: number; liked: boolean };
export type Report = { thread_id: string | null; reported_content: string | null; id: string; discussion_id: string | null; reply_id: string | null; reason: string; status: string; created_at: string; reporter: Profile };
export type BoardData = { me: Profile; posts: Post[]; thread: Post | null; replies: Reply[]; reports: Report[]; more: boolean; more_replies: boolean };
export const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const mutationActions = ['profile', 'create', 'edit', 'delete', 'reply', 'edit_reply', 'delete_reply', 'react', 'report', 'moderate'] as const;
export function validMutation(value: unknown): value is { action: typeof mutationActions[number]; requestId: string; payload: Record<string, unknown> } {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return typeof v.action === 'string' && mutationActions.includes(v.action as typeof mutationActions[number]) && typeof v.requestId === 'string' && uuidPattern.test(v.requestId) && !!v.payload && typeof v.payload === 'object' && !Array.isArray(v.payload);
}
export function initials(name: string) { return name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase() || 'M'; }
