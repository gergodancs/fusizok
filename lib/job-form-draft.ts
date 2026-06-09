import { migrateLegacyDistrict } from "@/lib/places";

export type JobFormDraft = {
  title: string;
  category: string;
  county: string;
  place: string;
  description: string;
  required_completion_time: string;
};

const DRAFT_KEY = "fusizok-job-draft";

type LegacyJobFormDraft = Partial<JobFormDraft> & {
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
  let place = typeof raw.place === "string" ? raw.place : "";

  if ((!county || !place) && raw.zip_code) {
    const legacy = migrateLegacyDistrict(raw.zip_code);
    if (legacy) {
      county = legacy.county;
      place = legacy.place;
    } else if (!place) {
      place = raw.zip_code;
    }
  }

  return {
    title: raw.title,
    category: raw.category,
    county,
    place,
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
