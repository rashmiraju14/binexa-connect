import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const requireAccount = cache(async (next: string) => {
  const destination = `/?auth=sign-up&next=${encodeURIComponent(next)}`;
  if (!isSupabaseConfigured()) redirect(destination);
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect(destination);
  return user;
});
