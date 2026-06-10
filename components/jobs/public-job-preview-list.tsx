import Link from "next/link";
import { getMainCategoryLabel } from "@/lib/constants/categories";
import type { PublicJobPreview } from "@/lib/jobs/job-listing";
import { formatPublicJobLocation } from "@/lib/privacy/job-public";

type PublicJobPreviewListProps = {
  jobs: PublicJobPreview[];
  title: string;
  subtitle?: string;
  ctaHref?: string;
  ctaLabel?: string;
};

export function PublicJobPreviewList({
  jobs,
  title,
  subtitle,
  ctaHref,
  ctaLabel,
}: PublicJobPreviewListProps) {
  if (jobs.length === 0) {
    return null;
  }

  return (
    <section className="border-t border-zinc-800 bg-zinc-950">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-zinc-50">
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
                {subtitle}
              </p>
            ) : null}
          </div>
          {ctaHref && ctaLabel ? (
            <Link
              href={ctaHref}
              className="inline-flex shrink-0 items-center justify-center rounded-xl border border-amber-500/40 bg-amber-500/10 px-5 py-2.5 text-sm font-semibold text-amber-400 transition hover:bg-amber-500/20"
            >
              {ctaLabel}
            </Link>
          ) : null}
        </div>

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <li key={job.id}>
              <Link
                href={`/hirdetes/${job.id}`}
                className="group flex h-full flex-col rounded-2xl border border-zinc-700/80 bg-zinc-800/50 p-5 transition hover:border-amber-500/40 hover:bg-zinc-800/80"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-400/90">
                  {getMainCategoryLabel(job.category)}
                </p>
                <h3 className="mt-2 text-lg font-bold text-zinc-100 group-hover:text-amber-300">
                  {job.title}
                </h3>
                <p className="mt-2 text-sm text-zinc-500">
                  {formatPublicJobLocation(job)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
