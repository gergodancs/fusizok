import { normalizeProfessions } from "@/lib/craftsman";
import { normalizeCoverageAreas, type CoverageArea } from "@/lib/places";
import { createClient } from "@/lib/supabase/server";

export type CraftsmanProfileEdit = {
  professions: string[];
  coverageAreas: CoverageArea[];
  bio: string | null;
};

export async function getCraftsmanProfileForEdit(
  userId: string,
): Promise<CraftsmanProfileEdit> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("craftsman_profiles")
    .select("profession, coverage_counties, coverage_zip_codes, bio")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("Fusizó profil lekérdezési hiba:", error.message);
    return { professions: [], coverageAreas: [], bio: null };
  }

  return {
    professions: normalizeProfessions(data?.profession),
    coverageAreas: normalizeCoverageAreas(
      data?.coverage_counties,
      data?.coverage_zip_codes,
    ),
    bio: data?.bio?.trim() || null,
  };
}
