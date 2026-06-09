import { migrateLegacyDistrict } from "@/lib/places";
import type { LocationMode } from "@/lib/location/types";

export type JobFormDraft = {
  title: string;
  category: string;
  locationMode: LocationMode | null;
  latitude: number | null;
  longitude: number | null;
  county: string;
  city: string;
  description: string;
  required_completion_time: string;
};

const DRAFT_KEY = "fusizok-job-draft";

type LegacyJobFormDraft = Partial<JobFormDraft> & {
  place?: string;
  zip_code?: string;
};

function normalizeDraft(raw: LegacyJobFormDraft): JobFormDraft | null {
  if (
    typeof raw.title !== "string" ||
    typeof raw.category !== "string" ||
    typeof raw.description !== "string" ||
    typeof raw.required_completion_time !== "string"
  ) {
    return null;
  }

  let county = typeof raw.county === "string" ? raw.county : "";
  let city = typeof raw.city === "string" ? raw.city : "";
  const locationMode = raw.locationMode ?? null;
  const latitude =
    typeof raw.latitude === "number" && Number.isFinite(raw.latitude)
      ? raw.latitude
      : null;
  const longitude =
    typeof raw.longitude === "number" && Number.isFinite(raw.longitude)
      ? raw.longitude
      : null;

  if ((!county || !city) && (raw.place || raw.zip_code)) {
    const legacy = migrateLegacyDistrict(raw.place ?? raw.zip_code ?? "");
    if (legacy) {
      county = legacy.county;
      city = legacy.place;
    } else if (!city) {
      city = raw.place ?? raw.zip_code ?? "";
    }
  }

  return {
    title: raw.title,
    category: raw.category,
    locationMode,
    latitude,
    longitude,
    county,
    city,
    description: raw.description,
    required_completion_time: raw.required_completion_time,
  };
}

export function saveJobFormDraft(draft: JobFormDraft): void {
  sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

export function loadJobFormDraft(): JobFormDraft | null {
  const raw = sessionStorage.getItem(DRAFT_KEY);
  if (!raw) return null;

  try {
    return normalizeDraft(JSON.parse(raw) as LegacyJobFormDraft);
  } catch {
    return null;
  }
}

export function clearJobFormDraft(): void {
  sessionStorage.removeItem(DRAFT_KEY);
}
