/** Megrendelő neve publikus nézetben – csak keresztnév vagy „Egy lakos”. */
export function anonymizeClientDisplayName(
  fullName: string | null | undefined,
): string {
  const trimmed = fullName?.trim();
  if (!trimmed) {
    return "Egy lakos";
  }

  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return parts[parts.length - 1]!;
  }

  return parts[0]!;
}

/** Publikus helyszín – város / megye, pontos cím és irányítószám nélkül. */
export function formatPublicJobLocation(job: {
  county?: string | null;
  city?: string | null;
}): string {
  const county = job.county?.trim();
  const city = job.city?.trim();

  if (county === "Budapest" && city) {
    return city;
  }

  if (city && county) {
    return `${city}, ${county} megye`;
  }

  if (city) {
    return city;
  }

  if (county) {
    return `${county} megye`;
  }

  return "Magyarország";
}

export function buildPublicJobSeoTitle(
  title: string,
  locationLabel: string,
): string {
  return `${title} – Fusimunka ${locationLabel} területén | Fusizok.hu`;
}
