import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JobBidForm } from "@/components/jobs/job-bid-form";
import { JobImageGallery } from "@/components/jobs/job-image-gallery";
import { PageContainer } from "@/components/layout/page-container";
import { JobMarketStats } from "@/components/jobs/job-market-stats";
import { requireCraftsman } from "@/lib/auth/require-craftsman";
import { getCraftsmanCreditBalance } from "@/lib/credits/balance";
import { getJobBidStats } from "@/lib/job-bid-stats";
import { formatJobLocation } from "@/lib/places";
import { createClient } from "@/lib/supabase/server";
import { cardClassName, pageEyebrowClassName } from "@/lib/ui-classes";

export const metadata: Metadata = {
  title: "Munka részletei – fusizok.hu",
};

type PalyazPageProps = {
  params: Promise<{ jobId: string }>;
};

export default async function PalyazPage({ params }: PalyazPageProps) {
  const { jobId } = await params;
  const { user } = await requireCraftsman(`/szaki/palyaz/${jobId}`);

  const supabase = await createClient();
  const { data: job } = await supabase
    .from("jobs")
    .select(
      "id, title, description, category, county, city, zip_code, location_gps, status, required_completion_time, image_urls, created_at",
    )
    .eq("id", jobId)
    .eq("status", "open")
    .maybeSingle();

  if (!job) {
    notFound();
  }

  const [bidStats, creditBalance] = await Promise.all([
    getJobBidStats(job.id),
    getCraftsmanCreditBalance(user.id),
  ]);
  const imageUrls = (job.image_urls as string[] | null) ?? [];

  return (
    <div className="min-h-full bg-gradient-to-b from-zinc-950 to-zinc-900">
      <PageContainer narrow>
        <Link
          href="/szaki"
          className="text-sm text-amber-400 hover:text-amber-300"
        >
          ← Vissza a munkákhoz
        </Link>

        <div className="mb-8 mt-4">
          <p className={pageEyebrowClassName}>Munka részletei</p>
          <h1 className="mt-2 text-3xl font-black text-zinc-50">{job.title}</h1>
          <p className="mt-2 text-sm text-zinc-500">
            {job.category} · {formatJobLocation(job)}
            {job.required_completion_time && (
              <> · Határidő: {job.required_completion_time}</>
            )}
          </p>
          <JobMarketStats stats={bidStats} className="mt-3" />
          <p className="mt-4 whitespace-pre-wrap text-zinc-400">
            {job.description}
          </p>

          {imageUrls.length > 0 && (
            <div className="mt-6">
              <JobImageGallery imageUrls={imageUrls} title={job.title} />
            </div>
          )}
        </div>

        <div className={`${cardClassName} p-6 sm:p-8`}>
          <h2 className="mb-6 text-lg font-bold text-zinc-100">Pályázati űrlap</h2>
          <JobBidForm
            jobId={job.id}
            jobTitle={job.title}
            creditBalance={creditBalance}
          />
        </div>
      </PageContainer>
    </div>
  );
}
