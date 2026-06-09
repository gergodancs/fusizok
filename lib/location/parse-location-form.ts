import { isValidJobLocation } from "@/lib/places";
import type { ParsedLocation } from "@/lib/location/types";

function parseCoordinate(value: FormDataEntryValue | null): number | null {
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function isValidCoordinate(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

export function parseLocationFromFormData(
  formData: FormData,
): ParsedLocation | null {
  const mode = (formData.get("location_mode") as string | null)?.trim();
  const latitude = parseCoordinate(formData.get("location_lat"));
  const longitude = parseCoordinate(formData.get("location_lng"));
  const county = ((formData.get("county") as string) ?? "").trim();
  const city = ((formData.get("city") as string) ?? "").trim();

  if (
    mode === "gps" &&
    latitude !== null &&
    longitude !== null &&
    isValidCoordinate(latitude, longitude)
  ) {
    return {
      mode: "gps",
      latitude,
      longitude,
      county: null,
      city: null,
    };
  }

  if (county && city && isValidJobLocation(county, city)) {
    return {
      mode: "manual",
      latitude: null,
      longitude: null,
      county,
      city,
    };
  }

  return null;
}

export function parseServiceRadiusKm(formData: FormData): number {
  const raw = Number.parseInt(
    ((formData.get("service_radius_km") as string) ?? "").trim(),
    10,
  );

  if (!Number.isFinite(raw)) {
    return 25;
  }

  return Math.min(100, Math.max(5, raw));
}

export function hasCraftsmanLocation(
  location: ParsedLocation | null,
): boolean {
  return location !== null;
}
