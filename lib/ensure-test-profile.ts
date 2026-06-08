import { TEST_CLIENT_PROFILE } from "@/lib/constants/dev";
import { createAdminClient } from "@/lib/supabase/admin";

export async function ensureTestClientProfile(): Promise<boolean> {
  const admin = createAdminClient();
  if (!admin) return false;

  const { error } = await admin
    .from("profiles")
    .upsert(TEST_CLIENT_PROFILE, { onConflict: "id" });

  if (error) {
    console.error("Teszt profil létrehozási hiba:", error);
    return false;
  }

  return true;
}
