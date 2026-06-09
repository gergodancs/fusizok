import { normalizeDistricts, normalizeProfessions } from "@/lib/craftsman";
import { createClient } from "@/lib/supabase/server";

export type CraftsmanProfileEdit = {
  professions: string[];
  districts: string[];
  bio: string | null;
};

export async function getCraftsmanProfileForEdit(
  userId: string,
): Promise<CraftsmanProfileEdit> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("craftsman_profiles")
    .select("profession, coverage_zip_codes, bio")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("Fusizó profil lekérdezési hiba:", error.message);
    return { professions: [], districts: [], bio: null };
  }

  return {
    professions: normalizeProfessions(data?.profession),
    districts: normalizeDistricts(data?.coverage_zip_codes),
    bio: data?.bio?.trim() || null,
  };
}
