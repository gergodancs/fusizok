import { normalizeProfessions } from "@/lib/craftsman";
import { normalizeMainCategoryId } from "@/lib/constants/categories";
import {
  DEFAULT_SERVICE_RADIUS_KM,
  type LocationMode,
} from "@/lib/location/types";
import { normalizeCoverageAreas, type CoverageArea } from "@/lib/places";
import { createClient } from "@/lib/supabase/server";

export type CraftsmanLocationEdit = {
  mode: LocationMode | null;
  latitude: number | null;
  longitude: number | null;
  county: string;
  city: string;
  serviceRadiusKm: number;
};

export type CraftsmanProfileEdit = {
  professions: string[];
  subCategories: string[];
  coverageAreas: CoverageArea[];
  location: CraftsmanLocationEdit;
  /** Geokódolt bázispont a DB-ben (location_gps) – régi és új profilokhoz is. */
  hasStoredCoordinates: boolean;
  bio: string | null;
};

export function craftsmanHasServiceArea(profile: CraftsmanProfileEdit): boolean {
  if (profile.location.county && profile.location.city) {
    return true;
  }
  if (profile.coverageAreas.length > 0) {
    return true;
  }
  if (profile.hasStoredCoordinates) {
    return true;
  }
  return false;
}

export async function getCraftsmanProfileForEdit(
  userId: string,
): Promise<CraftsmanProfileEdit> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("craftsman_profiles")
    .select(
      "profession, sub_categories, coverage_counties, coverage_zip_codes, county, city, location_gps, service_radius_km, bio",
    )
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("Fusizó profil lekérdezési hiba:", error.message);
    return emptyProfileEdit();
  }

  const coverageAreas = normalizeCoverageAreas(
    data?.coverage_counties,
    data?.coverage_zip_codes,
  );

  const county =
    data?.county?.trim() ||
    coverageAreas[0]?.county ||
    "";
  const city =
    data?.city?.trim() ||
    coverageAreas[0]?.place ||
    "";

  const professions = normalizeProfessions(data?.profession)
    .map((p) => normalizeMainCategoryId(p) ?? p)
    .filter(Boolean);

  return {
    professions,
    subCategories: (data?.sub_categories as string[] | null) ?? [],
    coverageAreas,
    location: {
      mode: county && city ? "manual" : null,
      latitude: null,
      longitude: null,
      county,
      city,
      serviceRadiusKm: data?.service_radius_km ?? DEFAULT_SERVICE_RADIUS_KM,
    },
    hasStoredCoordinates: Boolean(data?.location_gps),
    bio: data?.bio?.trim() || null,
  };
}

function emptyProfileEdit(): CraftsmanProfileEdit {
  return {
    professions: [],
    subCategories: [],
    coverageAreas: [],
    location: {
      mode: null,
      latitude: null,
      longitude: null,
      county: "",
      city: "",
      serviceRadiusKm: DEFAULT_SERVICE_RADIUS_KM,
    },
    hasStoredCoordinates: false,
    bio: null,
  };
}
