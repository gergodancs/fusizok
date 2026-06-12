import { isValidJobLocation, normalizeCoverageAreas, type CoverageArea } from "@/lib/places";
import {
  DEFAULT_SERVICE_RADIUS_KM,
  SERVICE_RADIUS_OPTIONS,
  type ParsedLocation,
} from "@/lib/location/types";

export function parseLocationFromFormData(
  formData: FormData,
): ParsedLocation | null {
  const county = ((formData.get("county") as string) ?? "").trim();
  const city = ((formData.get("city") as string) ?? "").trim();

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

  if (
    Number.isFinite(raw) &&
    SERVICE_RADIUS_OPTIONS.includes(raw as (typeof SERVICE_RADIUS_OPTIONS)[number])
  ) {
    return raw;
  }

  return DEFAULT_SERVICE_RADIUS_KM;
}

export function hasCraftsmanLocation(
  location: ParsedLocation | null,
): boolean {
  return location !== null;
}

export function parseCoverageAreasFromForm(formData: FormData): CoverageArea[] {
  const counties = formData
    .getAll("coverage_counties")
    .map((value) => String(value).trim());
  const places = formData
    .getAll("coverage_places")
    .map((value) => String(value).trim());

  return normalizeCoverageAreas(counties, places);
}
