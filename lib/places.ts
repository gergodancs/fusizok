import {
  BUDAPEST_DISTRICTS,
  isHungaryCounty,
  isPlaceInCounty,
} from "@/lib/data/hungaryPlaces";

export type CoverageArea = {
  county: string;
  place: string;
};

const LEGACY_ROMAN = [
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
  "X",
  "XI",
  "XII",
  "XIII",
  "XIV",
  "XV",
  "XVI",
  "XVII",
  "XVIII",
  "XIX",
  "XX",
  "XXI",
  "XXII",
  "XXIII",
] as const;

/** Régi „11. kerület” formátum → új „Budapest XI. kerület”. */
export function migrateLegacyDistrict(
  legacyPlace: string,
): CoverageArea | null {
  const match = /^(\d{1,2})\.\s*kerület$/i.exec(legacyPlace.trim());
  if (!match) {
    return null;
  }

  const index = Number.parseInt(match[1], 10) - 1;
  const roman = LEGACY_ROMAN[index];
  if (!roman) {
    return null;
  }

  return {
    county: "Budapest",
    place: `Budapest ${roman}. kerület`,
  };
}

export function normalizeCoverageArea(
  county: string | null | undefined,
  place: string | null | undefined,
): CoverageArea | null {
  const countyTrimmed = county?.trim() ?? "";
  const placeTrimmed = place?.trim() ?? "";

  if (countyTrimmed && placeTrimmed) {
    if (isPlaceInCounty(countyTrimmed, placeTrimmed)) {
      return { county: countyTrimmed, place: placeTrimmed };
    }
    return null;
  }

  if (placeTrimmed) {
    const legacy = migrateLegacyDistrict(placeTrimmed);
    if (legacy) {
      return legacy;
    }
  }

  return null;
}

export function normalizeCoverageAreas(
  counties: string[] | null | undefined,
  places: string[] | null | undefined,
): CoverageArea[] {
  if (places?.length) {
    const result: CoverageArea[] = [];

    for (let i = 0; i < places.length; i += 1) {
      const county = counties?.[i];
      const normalized = normalizeCoverageArea(county, places[i]);
      if (normalized) {
        result.push(normalized);
      }
    }

    if (result.length > 0) {
      return dedupeCoverageAreas(result);
    }
  }

  return dedupeCoverageAreas(
    (places ?? [])
      .map((place) => normalizeCoverageArea(null, place))
      .filter((area): area is CoverageArea => area !== null),
  );
}

export function dedupeCoverageAreas(areas: CoverageArea[]): CoverageArea[] {
  const seen = new Set<string>();
  const result: CoverageArea[] = [];

  for (const area of areas) {
    const key = locationKey(area.county, area.place);
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    result.push(area);
  }

  return result;
}

export function locationKey(county: string, place: string): string {
  return `${county}|${place}`;
}

export function formatLocationLabel(county: string, place: string): string {
  if (county === "Budapest") {
    return place;
  }
  return `${place}, ${county} megye`;
}

export function formatJobLocation(job: {
  county?: string | null;
  city?: string | null;
  zip_code?: string | null;
  location_gps?: unknown | null;
}): string {
  if (job.location_gps) {
    return "GPS – pontos helyszín";
  }

  const placeName = job.city ?? job.zip_code;
  const area = normalizeCoverageArea(job.county, placeName);
  if (!area) {
    return placeName?.trim() || "—";
  }
  return formatLocationLabel(area.county, area.place);
}

export function isValidJobLocation(county: string, place: string): boolean {
  return isHungaryCounty(county) && isPlaceInCounty(county, place);
}

export function jobMatchesCoverage(
  job: {
    county?: string | null;
    place?: string | null;
    city?: string | null;
    zip_code?: string | null;
  },
  areas: CoverageArea[],
): boolean {
  const normalizedJob = normalizeCoverageArea(
    job.county,
    job.place ?? job.city ?? job.zip_code,
  );
  if (!normalizedJob) {
    return false;
  }

  const keys = new Set(areas.map((a) => locationKey(a.county, a.place)));
  return keys.has(locationKey(normalizedJob.county, normalizedJob.place));
}

/** @deprecated Csak visszafelé kompatibilitás – használd a normalizeCoverageAreas-t. */
export function isBudapestDistrict(value: string): boolean {
  return BUDAPEST_DISTRICTS.includes(value) || migrateLegacyDistrict(value) !== null;
}
