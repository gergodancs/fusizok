import { normalizeProfessions } from "@/lib/craftsman";
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
  coverageAreas: CoverageArea[];
  location: CraftsmanLocationEdit;
  bio: string | null;
};

export function craftsmanHasServiceArea(profile: CraftsmanProfileEdit): boolean {
  if (profile.location.mode === "gps") {
    return true;
  }
  if (profile.location.county && profile.location.city) {
    return true;
  }
  return profile.coverageAreas.length > 0;
}

export async function getCraftsmanProfileForEdit(
  userId: string,
): Promise<CraftsmanProfileEdit> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("craftsman_profiles")
    .select(
      "profession, coverage_counties, coverage_zip_codes, county, city, location_gps, service_radius_km, bio",
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

  const hasGps = Boolean(data?.location_gps);
  const county =
    data?.county?.trim() ||
    coverageAreas[0]?.county ||
    "";
  const city =
    data?.city?.trim() ||
    coverageAreas[0]?.place ||
    "";

  return {
    professions: normalizeProfessions(data?.profession),
    coverageAreas,
    location: {
      mode: hasGps ? "gps" : county && city ? "manual" : null,
      latitude: null,
      longitude: null,
      county,
      city,
      serviceRadiusKm: data?.service_radius_km ?? DEFAULT_SERVICE_RADIUS_KM,
    },
    bio: data?.bio?.trim() || null,
  };
}

function emptyProfileEdit(): CraftsmanProfileEdit {
  return {
    professions: [],
    coverageAreas: [],
    location: {
      mode: null,
      latitude: null,
      longitude: null,
      county: "",
      city: "",
      serviceRadiusKm: DEFAULT_SERVICE_RADIUS_KM,
    },
    bio: null,
  };
}
