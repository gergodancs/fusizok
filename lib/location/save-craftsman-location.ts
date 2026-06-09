import type { SupabaseClient } from "@supabase/supabase-js";
import {
  parseLocationFromFormData,
  parseServiceRadiusKm,
} from "@/lib/location/parse-location-form";
import { persistCraftsmanLocation } from "@/lib/location/persist-location";

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
  await persistCraftsmanLocation(
    supabase,
    craftsmanId,
    location,
    serviceRadiusKm,
  );
  return true;
}
