import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/types/profile";

function resolveRole(metadata: Record<string, unknown>): UserRole {
  return metadata.role === "craftsman" ? "craftsman" : "client";
}

/**
 * Szinkronizálja a profiles (és craftsman esetén craftsman_profiles) sorát
 * az auth user_metadata alapján. A DB trigger gyakran mindig 'client'-et ír –
 * ez javítja bejelentkezés/regisztráció után.
 */
export async function syncUserProfile(user: User): Promise<void> {
  const supabase = await createClient();
  const metadata = user.user_metadata ?? {};
  const role = resolveRole(metadata);
  const fullName =
    (typeof metadata.full_name === "string" && metadata.full_name.trim()) ||
    (typeof metadata.name === "string" && metadata.name.trim()) ||
    null;

  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      role,
      full_name: fullName,
    },
    { onConflict: "id" },
  );

  if (profileError) {
    console.error("Profil szinkronizálási hiba:", profileError.message);
  }

  if (role === "craftsman") {
    const { data: signupCredits, error: signupCreditsError } =
      await supabase.rpc("grant_craftsman_signup_credits");

    if (signupCreditsError) {
      console.error(
        "Induló kredit hiba:",
        signupCreditsError.message,
      );
    } else if (signupCredits?.granted) {
      console.log(
        "[syncUserProfile] Béta induló kredit jóváírva:",
        signupCredits.amount,
      );
    }
    const { error: craftsmanError } = await supabase
      .from("craftsman_profiles")
      .upsert(
        {
          id: user.id,
          coverage_counties: [],
          coverage_zip_codes: [],
          service_radius_km: 25,
        },
        { onConflict: "id", ignoreDuplicates: true },
      );

    if (craftsmanError) {
      console.error("Fusizó profil szinkronizálási hiba:", craftsmanError.message);
    }
  }
}
