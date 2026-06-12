import type { SupabaseClient } from "@supabase/supabase-js";
import {
  applyCraftsmanLocationGps,
  applyJobLocationGps,
} from "@/lib/location/gps-db";
import { forwardGeocode } from "@/lib/location/geocode";
import type { ParsedLocation } from "@/lib/location/types";
import type { CoverageArea } from "@/lib/places";

export type ResolvedLocation = {
  mode: ParsedLocation["mode"];
  latitude: number | null;
  longitude: number | null;
  county: string | null;
  city: string | null;
  label: string | null;
};

export async function resolveLocationForSave(
  location: ParsedLocation,
): Promise<ResolvedLocation> {
  const geocoded = await forwardGeocode(location.county, location.city);

  return {
    mode: "manual",
    latitude: geocoded?.latitude ?? null,
    longitude: geocoded?.longitude ?? null,
    county: location.county,
    city: location.city,
    label: geocoded?.label ?? `${location.city}, ${location.county} megye`,
  };
}

export async function persistJobLocation(
  supabase: SupabaseClient,
  jobId: string,
  location: ParsedLocation,
): Promise<ResolvedLocation> {
  const resolved = await resolveLocationForSave(location);

  const { error } = await supabase
    .from("jobs")
    .update({
      county: resolved.county,
      city: resolved.city,
      zip_code: resolved.city,
    })
    .eq("id", jobId);

  if (error) {
    console.error("Job helyszín frissítési hiba:", error.message);
  }

  await applyJobLocationGps(
    supabase,
    jobId,
    resolved.latitude,
    resolved.longitude,
  );

  return resolved;
}

export async function persistCraftsmanLocation(
  supabase: SupabaseClient,
  craftsmanId: string,
  location: ParsedLocation,
  serviceRadiusKm: number,
  coverageAreas?: CoverageArea[],
): Promise<ResolvedLocation> {
  const resolved = await resolveLocationForSave(location);

  const coveragePayload =
    coverageAreas && coverageAreas.length > 0
      ? {
          coverage_counties: coverageAreas.map((area) => area.county),
          coverage_zip_codes: coverageAreas.map((area) => area.place),
        }
      : {
          coverage_counties: resolved.county ? [resolved.county] : [],
          coverage_zip_codes: resolved.city ? [resolved.city] : [],
        };

  const payload: Record<string, unknown> = {
    service_radius_km: serviceRadiusKm,
    county: resolved.county,
    city: resolved.city,
    ...coveragePayload,
  };

  const { error } = await supabase
    .from("craftsman_profiles")
    .update(payload)
    .eq("id", craftsmanId);

  if (error) {
    console.error("Fusizó helyszín frissítési hiba:", error.message);
  }

  await applyCraftsmanLocationGps(
    supabase,
    craftsmanId,
    resolved.latitude,
    resolved.longitude,
  );

  return resolved;
}
