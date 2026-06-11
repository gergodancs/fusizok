import {
  listPlaceholderJobPreviews,
  type PublicJobPreviewItem,
} from "@/lib/jobs/placeholder-jobs";
import { listRecentOpenJobsForPublic } from "@/lib/jobs/job-listing";

/** Valódi + példa hirdetések a főoldal vendég nézetéhez (fusizók nem látják). */
export async function listGuestHomepageJobPreviews(
  limit = 10,
): Promise<PublicJobPreviewItem[]> {
  const [realJobs, placeholderJobs] = await Promise.all([
    listRecentOpenJobsForPublic(limit),
    Promise.resolve(listPlaceholderJobPreviews()),
  ]);

  const realItems: PublicJobPreviewItem[] = realJobs.map((job) => ({
    ...job,
    isPlaceholder: false,
  }));

  const realIds = new Set(realItems.map((job) => job.id));
  const fillers = placeholderJobs.filter((job) => !realIds.has(job.id));

  return [...realItems, ...fillers].slice(0, limit);
}
