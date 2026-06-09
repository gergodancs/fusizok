import {
  BUDAPEST_DISTRICTS,
  HUNGARY_COUNTIES,
  isHungaryCounty,
  isPlaceInCounty,
} from "@/lib/data/hungaryPlaces";
import { migrateLegacyDistrict } from "@/lib/places";

export type GeocodedPlace = {
  county: string;
  city: string;
  latitude: number;
  longitude: number;
  label: string;
};

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";
const USER_AGENT =
  process.env.GEOCODE_USER_AGENT ?? "fusizok.hu/1.0 (location-matching)";

const geocodeCache = new Map<string, GeocodedPlace | null>();

function cacheKey(parts: string[]): string {
  return parts.join("|");
}

function normalizeCountyName(raw: string | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  if (/budapest/i.test(trimmed)) {
    return "Budapest";
  }

  const withoutSuffix = trimmed
    .replace(/\s+(vármegye|megye)$/i, "")
    .trim();

  if (isHungaryCounty(withoutSuffix)) {
    return withoutSuffix;
  }

  const direct = HUNGARY_COUNTIES.find(
    (county) =>
      county.name.toLocaleLowerCase("hu") === withoutSuffix.toLocaleLowerCase("hu"),
  );
  return direct?.name ?? null;
}

function matchBudapestDistrict(...candidates: (string | undefined)[]): string | null {
  for (const candidate of candidates) {
    if (!candidate) continue;
    const value = candidate.trim();
    if (!value) continue;

    const exact = BUDAPEST_DISTRICTS.find(
      (district) => district.toLocaleLowerCase("hu") === value.toLocaleLowerCase("hu"),
    );
    if (exact) return exact;

    for (const district of BUDAPEST_DISTRICTS) {
      const roman = district.replace("Budapest ", "").replace(" kerület", "");
      if (value.toLocaleLowerCase("hu").includes(roman.toLocaleLowerCase("hu"))) {
        return district;
      }
    }

    const legacy = migrateLegacyDistrict(value);
    if (legacy?.county === "Budapest") {
      return legacy.place;
    }
  }

  return null;
}

function matchPlaceInCounty(county: string, ...candidates: (string | undefined)[]): string | null {
  if (county === "Budapest") {
    return matchBudapestDistrict(...candidates);
  }

  const places = HUNGARY_COUNTIES.find((c) => c.name === county)?.places ?? [];

  for (const candidate of candidates) {
    if (!candidate) continue;
    const value = candidate.trim();
    if (!value) continue;

    const exact = places.find(
      (place) => place.toLocaleLowerCase("hu") === value.toLocaleLowerCase("hu"),
    );
    if (exact) return exact;

    const partial = places.find((place) =>
      value.toLocaleLowerCase("hu").includes(place.toLocaleLowerCase("hu")),
    );
    if (partial) return partial;
  }

  return null;
}

export function resolveKnownPlace(
  countyRaw: string | null | undefined,
  placeCandidates: (string | undefined)[],
): GeocodedPlace | null {
  const county = normalizeCountyName(countyRaw ?? "");
  if (!county) return null;

  const city = matchPlaceInCounty(county, ...placeCandidates);
  if (!city) return null;

  return {
    county,
    city,
    latitude: 0,
    longitude: 0,
    label: county === "Budapest" ? city : `${city}, ${county} megye`,
  };
}

async function nominatimFetch(path: string): Promise<unknown | null> {
  try {
    const response = await fetch(`${NOMINATIM_BASE}${path}`, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "application/json",
      },
      next: { revalidate: 86400 },
    });

    if (!response.ok) {
      console.error("[geocode] Nominatim hiba:", response.status, path);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("[geocode] Nominatim exception:", error);
    return null;
  }
}

export async function reverseGeocode(
  latitude: number,
  longitude: number,
): Promise<GeocodedPlace | null> {
  const key = cacheKey(["rev", latitude.toFixed(4), longitude.toFixed(4)]);
  if (geocodeCache.has(key)) {
    return geocodeCache.get(key) ?? null;
  }

  const data = (await nominatimFetch(
    `/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1&accept-language=hu`,
  )) as { address?: Record<string, string> } | null;

  const address = data?.address;
  if (!address) {
    geocodeCache.set(key, null);
    return null;
  }

  const county =
    normalizeCountyName(
      address.county ?? address.state ?? address["ISO3166-2-lvl4"] ?? address.city,
    ) ?? (address.city === "Budapest" ? "Budapest" : null);

  if (!county) {
    geocodeCache.set(key, null);
    return null;
  }

  const city = matchPlaceInCounty(
    county,
    address.city_district,
    address.suburb,
    address.neighbourhood,
    address.quarter,
    address.town,
    address.village,
    address.city,
    address.municipality,
  );

  if (!city) {
    geocodeCache.set(key, null);
    return null;
  }

  const result: GeocodedPlace = {
    county,
    city,
    latitude,
    longitude,
    label: county === "Budapest" ? city : `${city}, ${county} megye`,
  };

  geocodeCache.set(key, result);
  return result;
}

export async function forwardGeocode(
  county: string,
  city: string,
): Promise<GeocodedPlace | null> {
  if (!isHungaryCounty(county) || !isPlaceInCounty(county, city)) {
    return null;
  }

  const key = cacheKey(["fwd", county, city]);
  if (geocodeCache.has(key)) {
    return geocodeCache.get(key) ?? null;
  }

  const query = encodeURIComponent(`${city}, ${county}, Hungary`);
  const results = (await nominatimFetch(
    `/search?q=${query}&format=json&limit=1&countrycodes=hu`,
  )) as Array<{ lat: string; lon: string }> | null;

  const hit = results?.[0];
  if (!hit) {
    geocodeCache.set(key, null);
    return null;
  }

  const latitude = Number.parseFloat(hit.lat);
  const longitude = Number.parseFloat(hit.lon);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    geocodeCache.set(key, null);
    return null;
  }

  const result: GeocodedPlace = {
    county,
    city,
    latitude,
    longitude,
    label: county === "Budapest" ? city : `${city}, ${county} megye`,
  };

  geocodeCache.set(key, result);
  return result;
}
