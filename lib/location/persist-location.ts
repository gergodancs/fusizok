import type { SupabaseClient } from "@supabase/supabase-js";
import { applyCraftsmanLocationGps, applyJobLocationGps } from "@/lib/location/gps-db";
import { forwardGeocode, reverseGeocode } from "@/lib/location/geocode";
import type { ParsedLocation } from "@/lib/location/types";

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
  if (location.mode === "gps") {
    const reversed = await reverseGeocode(location.latitude, location.longitude);

    return {
      mode: "gps",
      latitude: location.latitude,
      longitude: location.longitude,
      county: reversed?.county ?? null,
      city: reversed?.city ?? null,
      label: reversed?.label ?? "GPS – pontos helyszín",
    };
  }

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

  if (resolved.latitude !== null && resolved.longitude !== null) {
    await applyJobLocationGps(supabase, jobId, {
      mode: "gps",
      latitude: resolved.latitude,
      longitude: resolved.longitude,
      county: null,
      city: null,
    });
  } else if (location.mode === "manual") {
    await applyJobLocationGps(supabase, jobId, location);
  }

  return resolved;
}

export async function persistCraftsmanLocation(
  supabase: SupabaseClient,
  craftsmanId: string,
  location: ParsedLocation,
  serviceRadiusKm: number,
): Promise<ResolvedLocation> {
  const resolved = await resolveLocationForSave(location);

  const payload: Record<string, unknown> = {
    service_radius_km: serviceRadiusKm,
    county: resolved.county,
    city: resolved.city,
    coverage_counties: resolved.county ? [resolved.county] : [],
    coverage_zip_codes: resolved.city ? [resolved.city] : [],
  };

  const { error } = await supabase
    .from("craftsman_profiles")
    .update(payload)
    .eq("id", craftsmanId);

  if (error) {
    console.error("Fusizó helyszín frissítési hiba:", error.message);
  }

  if (location.mode === "gps") {
    await applyCraftsmanLocationGps(supabase, craftsmanId, location);
  } else if (resolved.latitude !== null && resolved.longitude !== null) {
    await applyCraftsmanLocationGps(supabase, craftsmanId, {
      mode: "gps",
      latitude: resolved.latitude,
      longitude: resolved.longitude,
      county: null,
      city: null,
    });
  } else {
    await applyCraftsmanLocationGps(supabase, craftsmanId, location);
  }

  return resolved;
}
