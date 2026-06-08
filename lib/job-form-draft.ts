export type JobFormDraft = {
  title: string;
  category: string;
  /** Budapesti kerület neve, pl. "11. kerület" */
  zip_code: string;
  description: string;
  required_completion_time: string;
};

const DRAFT_KEY = "fusizok-job-draft";

export function saveJobFormDraft(draft: JobFormDraft): void {
  sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

export function loadJobFormDraft(): JobFormDraft | null {
  const raw = sessionStorage.getItem(DRAFT_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as JobFormDraft;
  } catch {
    return null;
  }
}

export function clearJobFormDraft(): void {
  sessionStorage.removeItem(DRAFT_KEY);
}
