import CommunityHome from "@/components/CommunityHome";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function HomePage() {
  const supabase = isSupabaseConfigured() ? await createClient() : null;
  const result = supabase ? await supabase.auth.getUser() : null;
  return <CommunityHome authenticated={Boolean(result?.data.user && !result.error)} />;
}
