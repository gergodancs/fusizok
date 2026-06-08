import Link from "next/link";
import { JOB_STATUS_LABELS } from "@/lib/status-labels";
import type { Job } from "@/lib/types/job";
import { btnPrimaryClassName } from "@/lib/ui-classes";

const statusStyles: Record<Job["status"], string> = {
  open: "bg-emerald-500/15 text-emerald-400 ring-emerald-500/30",
  assigned: "bg-amber-500/15 text-amber-400 ring-amber-500/30",
  completed: "bg-zinc-700/50 text-zinc-400 ring-zinc-600/30",
  cancelled: "bg-red-500/10 text-red-400 ring-red-500/20",
};

type JobCardProps = {
  job: Job;
};

export function JobCard({ job }: JobCardProps) {
  const detailHref = `/szaki/palyaz/${job.id}`;
  const imageCount = job.image_urls?.length ?? 0;

  return (
    <article className="group flex flex-col rounded-2xl border border-zinc-700/80 bg-zinc-800/80 p-6 shadow-lg shadow-black/20 transition hover:border-amber-500/40 hover:shadow-amber-500/5">
      <Link href={detailHref} className="flex-1">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <h3 className="text-lg font-bold tracking-tight text-zinc-100 group-hover:text-amber-400">
            {job.title}
          </h3>
          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${statusStyles[job.status]}`}
          >
            {JOB_STATUS_LABELS[job.status]}
          </span>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded-lg bg-amber-500/15 px-2.5 py-1 text-xs font-semibold text-amber-400">
            {job.category}
          </span>
          <span className="inline-flex items-center rounded-lg bg-zinc-700/80 px-2.5 py-1 text-xs font-medium text-zinc-400">
            Kerület: {job.zip_code}
          </span>
          {imageCount > 0 && (
            <span className="inline-flex items-center rounded-lg bg-zinc-700/80 px-2.5 py-1 text-xs font-medium text-zinc-400">
              {imageCount} kép
            </span>
          )}
        </div>

        <p className="line-clamp-3 text-sm leading-relaxed text-zinc-400">
          {job.description}
        </p>
      </Link>

      {job.status === "open" && (
        <Link
          href={detailHref}
          className={`mt-5 block text-center ${btnPrimaryClassName}`}
        >
          Pályázok
        </Link>
      )}
    </article>
  );
}
