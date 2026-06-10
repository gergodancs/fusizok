/** Pontos feladási idő (tooltip / datetime attribútum). */
export function formatJobPostedAtExact(
  createdAt: string | null | undefined,
): string | null {
  if (!createdAt) {
    return null;
  }

  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleString("hu-HU", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Emberi olvasható feladási idő fusizó listákhoz és részletekhez. */
export function formatJobPostedAt(
  createdAt: string | null | undefined,
  now: Date = new Date(),
): string | null {
  if (!createdAt) {
    return null;
  }

  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const diffMs = Math.max(0, now.getTime() - date.getTime());
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) {
    return "épp most";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} perce`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} órája`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) {
    return "tegnap";
  }

  if (diffDays < 7) {
    return `${diffDays} napja`;
  }

  return date.toLocaleDateString("hu-HU", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
