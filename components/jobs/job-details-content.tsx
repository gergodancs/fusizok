import { JobImageGallery } from "@/components/jobs/job-image-gallery";
import { JobImagesLocked } from "@/components/jobs/job-images-locked";
import { JobMarketStats } from "@/components/jobs/job-market-stats";
import {
  formatSubCategoryLabels,
  getMainCategoryLabel,
} from "@/lib/constants/categories";
import { formatJobLocation } from "@/lib/places";
import { formatPublicJobLocation } from "@/lib/privacy/job-public";
import { pageEyebrowClassName } from "@/lib/ui-classes";
import type { JobBidStats } from "@/lib/job-bid-stats";

type JobDetailsContentProps = {
  title: string;
  description: string;
  category: string;
  subCategories: string[];
  locationLabel: string;
  requiredCompletionTime?: string | null;
  bidStats: JobBidStats;
  imageUrls?: string[];
  lockedImages?: boolean;
  imageCount?: number;
  clientLabel?: string | null;
  isPublicView?: boolean;
};

export function JobDetailsContent({
  title,
  description,
  category,
  subCategories,
  locationLabel,
  requiredCompletionTime,
  bidStats,
  imageUrls = [],
  lockedImages = false,
  imageCount = 0,
  clientLabel,
  isPublicView = false,
}: JobDetailsContentProps) {
  const subLabels = formatSubCategoryLabels(subCategories);

  return (
    <div className="mb-8">
      <p className={pageEyebrowClassName}>
        {isPublicView ? "Nyitott fusimunka" : "Munka részletei"}
      </p>
      <h1 className="mt-2 text-3xl font-black text-zinc-50">{title}</h1>
      <p className="mt-2 text-sm text-zinc-500">
        {getMainCategoryLabel(category)} · {locationLabel}
        {requiredCompletionTime && (
          <> · Határidő: {requiredCompletionTime}</>
        )}
      </p>
      {clientLabel && isPublicView && (
        <p className="mt-2 text-sm text-zinc-500">
          Megrendelő:{" "}
          <span className="text-zinc-400">{clientLabel}</span>
        </p>
      )}
      <JobMarketStats stats={bidStats} className="mt-3" />
      {subLabels.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {subLabels.map((label) => (
            <span
              key={label}
              className="rounded-lg bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-300"
            >
              {label}
            </span>
          ))}
        </div>
      )}
      <p className="mt-4 whitespace-pre-wrap text-zinc-400">{description}</p>

      {lockedImages && imageCount > 0 && (
        <div className="mt-6">
          <JobImagesLocked imageCount={imageCount} />
        </div>
      )}

      {!lockedImages && imageUrls.length > 0 && (
        <div className="mt-6">
          <JobImageGallery imageUrls={imageUrls} title={title} />
        </div>
      )}
    </div>
  );
}

export function getLocationLabelForJob(
  job: {
    county?: string | null;
    city?: string | null;
    zip_code?: string | null;
  },
  isPublicView: boolean,
): string {
  if (isPublicView) {
    return formatPublicJobLocation(job);
  }

  return formatJobLocation(job);
}
