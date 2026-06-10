"use client";

import { Edit, Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { cancelJob } from "@/app/actions/jobs";
import { JobEditModal } from "@/components/jobs/job-edit-modal";
import { formatJobLocation } from "@/lib/places";
import { getJobStatusLabel } from "@/lib/status-labels";
import type { Job } from "@/lib/types/job";
import { cardClassName } from "@/lib/ui-classes";

type ClientJobsManagerProps = {
  jobs: Job[];
};

export function ClientJobsManager({ jobs: initialJobs }: ClientJobsManagerProps) {
  const router = useRouter();
  const [jobs, setJobs] = useState(initialJobs);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete(job: Job) {
    const confirmed = window.confirm(
      "Biztosan törölni szeretnéd ezt a hirdetést? A művelet után a hirdetés nem lesz látható a szakik számára.",
    );

    if (!confirmed) {
      return;
    }

    setError(null);
    setDeletingId(job.id);

    startTransition(async () => {
      const result = await cancelJob(job.id);
      setDeletingId(null);

      if (result.error) {
        setError(result.error);
        return;
      }

      setJobs((current) => current.filter((item) => item.id !== job.id));
      router.refresh();
    });
  }

  if (jobs.length === 0) {
    return (
      <div className={`${cardClassName} p-8 text-center`}>
        <p className="text-zinc-400">
          Jelenleg nincs aktív hirdetésed. Adj fel új munkát a „Munka feladása”
          menüpontban.
        </p>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          {error}
        </div>
      )}

      <ul className="space-y-4">
        {jobs.map((job) => {
          const isDeleting = isPending && deletingId === job.id;
          const canEdit = job.status === "open";

          return (
            <li key={job.id} className={`${cardClassName} p-5 sm:p-6`}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold text-zinc-100">
                      {job.title}
                    </h2>
                    <span className="rounded-full border border-zinc-600 bg-zinc-800 px-2.5 py-0.5 text-xs font-medium text-zinc-400">
                      {getJobStatusLabel(job.status)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-amber-400/90">
                    {formatJobLocation(job)}
                  </p>
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-zinc-400">
                    {job.description}
                  </p>
                </div>

                <div className="flex shrink-0 gap-2">
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => setEditingJob(job)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm font-medium text-zinc-200 transition hover:border-amber-500/50 hover:text-amber-400"
                    >
                      <Edit className="h-4 w-4" strokeWidth={1.75} />
                      Szerkesztés
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(job)}
                    disabled={isDeleting}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/20 disabled:opacity-60"
                  >
                    {isDeleting ? (
                      <Loader2
                        className="h-4 w-4 animate-spin"
                        strokeWidth={1.75}
                      />
                    ) : (
                      <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                    )}
                    Törlés
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {editingJob && (
        <JobEditModal
          job={editingJob}
          onClose={() => setEditingJob(null)}
          onSuccess={() => {
            router.refresh();
          }}
        />
      )}
    </>
  );
}
