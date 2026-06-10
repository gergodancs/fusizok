/** Visszajelzés / hiba / ötlet – mailto link előre kitöltött tárggyal. */
export const FEEDBACK_EMAIL = "info@fusizok.hu";

export const FEEDBACK_SUBJECT = "Fusizok.hu visszajelzés";

export const FEEDBACK_BODY_HINT =
  "Írd le röviden, mit tapasztaltál vagy milyen ötleted van. Ha hibáról van szó, add meg a lépéseket és a böngészőt is, ha tudod.";

export function getFeedbackMailtoUrl(pageUrl?: string): string {
  const body = pageUrl
    ? `${FEEDBACK_BODY_HINT}\n\nOldal: ${pageUrl}`
    : FEEDBACK_BODY_HINT;

  const params = new URLSearchParams({
    subject: FEEDBACK_SUBJECT,
    body,
  });

  return `mailto:${FEEDBACK_EMAIL}?${params.toString()}`;
}
