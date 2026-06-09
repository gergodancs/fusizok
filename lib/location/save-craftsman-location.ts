import type { SupabaseClient } from "@supabase/supabase-js";
import { applyCraftsmanLocationGps } from "@/lib/location/gps-db";
import {
  parseLocationFromFormData,
  parseServiceRadiusKm,
} from "@/lib/location/parse-location-form";

export async function saveCraftsmanLocationFromForm(
  supabase: SupabaseClient,
  craftsmanId: string,
  formData: FormData,
): Promise<boolean> {
  const location = parseLocationFromFormData(formData);
  if (!location) {
    return false;
  }

  const serviceRadiusKm = parseServiceRadiusKm(formData);

  const payload =
    location.mode === "gps"
      ? {
          county: null,
          city: null,
          coverage_counties: [],
          coverage_zip_codes: [],
          service_radius_km: serviceRadiusKm,
        }
      : {
          county: location.county,
          city: location.city,
          coverage_counties: [location.county],
          coverage_zip_codes: [location.city],
          service_radius_km: serviceRadiusKm,
        };

  const { error } = await supabase
    .from("craftsman_profiles")
    .update(payload)
    .eq("id", craftsmanId);

  if (error) {
    console.error("Fusizó helyszín mentési hiba:", error.message);
    return false;
  }

  await applyCraftsmanLocationGps(supabase, craftsmanId, location);
  return true;
}
