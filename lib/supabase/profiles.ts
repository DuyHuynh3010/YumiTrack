import type { SupabaseClient, User } from "@supabase/supabase-js";

export async function ensureUserProfile(supabase: SupabaseClient, user: User) {
  await supabase.from("profiles").upsert(
    {
      id: user.id,
      email: user.email,
    },
    { onConflict: "id" },
  );
}
