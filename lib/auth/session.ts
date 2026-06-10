import { syncUserProfile } from "@/lib/auth/sync-profile";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types/profile";
import type { User } from "@supabase/supabase-js";

export type AuthContext = {
  user: User | null;
  profile: Profile | null;
};

export async function getSessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

export async function getUserProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, role, full_name, phone, avatar_url")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("Profil lekérdezési hiba:", error.message);
    return null;
  }

  return data as Profile | null;
}

/** Bejelentkezett user + profil; metadata alapján szinkronizál. */
export async function getAuthContext(): Promise<AuthContext> {
  const user = await getSessionUser();

  if (!user) {
    return { user: null, profile: null };
  }

  await syncUserProfile(user);
  const profile = await getUserProfile(user.id);

  return { user, profile };
}
