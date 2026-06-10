import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JobBidForm } from "@/components/jobs/job-bid-form";
import { JobCraftsmanCta } from "@/components/jobs/job-craftsman-cta";
import { PublicJobPreviewList } from "@/components/jobs/public-job-preview-list";
import {
  getLocationLabelForJob,
  JobDetailsContent,
} from "@/components/jobs/job-details-content";
import { PageContainer } from "@/components/layout/page-container";
import { getAuthContext } from "@/lib/auth/session";
import {
  getBidCreditCostForCategory,
  getMainCategoryLabel,
} from "@/lib/constants/categories";
import { getCraftsmanCreditBalance } from "@/lib/credits/balance";
import { formatCreditAmount } from "@/lib/credits/format";
import { getJobBidStats } from "@/lib/job-bid-stats";
import {
  getCraftsmanJobListing,
  getPublicJobListing,
  listSimilarOpenJobs,
} from "@/lib/jobs/job-listing";
import { buildJobPostingJsonLd } from "@/lib/seo/job-posting";
import { JsonLd } from "@/lib/seo/json-ld";
import {
  buildPublicJobSeoTitle,
  formatPublicJobLocation,
} from "@/lib/privacy/job-public";
import { getMetadataBaseUrl } from "@/lib/seo/site-url";
import { cardClassName } from "@/lib/ui-classes";

type HirdetesPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: HirdetesPageProps): Promise<Metadata> {
  const { id } = await params;
  const job = await getPublicJobListing(id);

  if (!job) {
    return {
      title: "Hirdetés nem található | Fusizok.hu",
      robots: { index: false, follow: false },
    };
  }

  const locationLabel = formatPublicJobLocation(job);
  const title = buildPublicJobSeoTitle(job.title, locationLabel);
  const description = `${getMainCategoryLabel(job.category)} – ${locationLabel}. ${job.description.slice(0, 140)}…`;
  const pageUrl = `${getMetadataBaseUrl()}/hirdetes/${job.id}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: pageUrl,
      type: "article",
      locale: "hu_HU",
      siteName: "Fusizok.hu",
    },
    alternates: {
      canonical: pageUrl,
    },
  };
}

export default async function HirdetesPage({ params }: HirdetesPageProps) {
  const { id } = await params;
  const { user, profile } = await getAuthContext();
  const isCraftsman = Boolean(user && profile?.role === "craftsman");

  if (isCraftsman) {
    const job = await getCraftsmanJobListing(id);

    if (!job) {
      notFound();
    }

    const imageUrls = (job.image_urls as string[] | null) ?? [];
    const [bidStats, creditBalance] = await Promise.all([
      getJobBidStats(job.id),
      getCraftsmanCreditBalance(user!.id),
    ]);
    const bidCreditCost = getBidCreditCostForCategory(job.category);

    return (
      <div className="min-h-full bg-gradient-to-b from-zinc-950 to-zinc-900">
        <PageContainer narrow>
          <Link
            href="/szaki"
            className="text-sm text-amber-400 hover:text-amber-300"
          >
            ← Vissza a munkákhoz
          </Link>

          <div className="mt-4">
            <JobDetailsContent
              title={job.title}
              description={job.description}
              category={job.category}
              subCategories={(job.sub_categories as string[] | null) ?? []}
              locationLabel={getLocationLabelForJob(job, false)}
              requiredCompletionTime={job.required_completion_time}
              bidStats={bidStats}
              imageUrls={imageUrls}
              lockedImages={false}
              postedAt={job.created_at}
            />
          </div>

          <div className={`${cardClassName} p-6 sm:p-8`}>
            <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-lg font-bold text-zinc-100">Pályázati űrlap</h2>
              <p className="text-sm text-zinc-500">
                Pályázati díj:{" "}
                <span className="font-semibold text-amber-400">
                  {formatCreditAmount(bidCreditCost)} kredit
                </span>
              </p>
            </div>
            <JobBidForm
              jobId={job.id}
              jobTitle={job.title}
              creditBalance={creditBalance}
              bidCreditCost={bidCreditCost}
            />
          </div>
        </PageContainer>
      </div>
    );
  }

  const publicJob = await getPublicJobListing(id);

  if (!publicJob) {
    notFound();
  }

  const similarJobs = await listSimilarOpenJobs(
    publicJob.id,
    publicJob.category,
    publicJob.city,
    publicJob.county,
    4,
  );

  const bidStats = {
    bidCount: publicJob.bid_count,
    contactSharedCount: 0,
  };

  return (
    <>
      <JsonLd data={buildJobPostingJsonLd(publicJob)} />
      <div className="min-h-full bg-gradient-to-b from-zinc-950 to-zinc-900">
        <PageContainer narrow>
          <Link
            href="/"
            className="text-sm text-amber-400 hover:text-amber-300"
          >
            ← Vissza a főoldalra
          </Link>

          <div className="mt-4">
            <JobDetailsContent
              title={publicJob.title}
              description={publicJob.description}
              category={publicJob.category}
              subCategories={publicJob.sub_categories}
              locationLabel={formatPublicJobLocation(publicJob)}
              requiredCompletionTime={publicJob.required_completion_time}
              bidStats={bidStats}
              lockedImages={publicJob.has_images}
              imageCount={publicJob.has_images ? 1 : 0}
              clientLabel={publicJob.client_display_name}
              isPublicView
              postedAt={publicJob.created_at}
            />
          </div>

          <JobCraftsmanCta jobId={publicJob.id} />
        </PageContainer>

        <PublicJobPreviewList
          jobs={similarJobs}
          title="Hasonló feladások"
          subtitle="További nyitott munkák ugyanabból a kategóriából a közeledben."
          ctaHref="/lakos"
          ctaLabel="Saját munka feladása"
        />
      </div>
    </>
  );
}
