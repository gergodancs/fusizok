"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { completeJob } from "@/app/actions/complete-job";
import { ReviewForm } from "@/components/reviews/review-form";
import { btnSecondaryClassName } from "@/lib/ui-classes";

type ChatJobActionsProps = {
  jobId: string;
  craftsmanId: string;
  craftsmanName: string;
  canCompleteJob: boolean;
  canSubmitReview: boolean;
  jobCompleted: boolean;
  hasReview: boolean;
};

export function ChatJobActions({
  jobId,
  craftsmanId,
  craftsmanName,
  canCompleteJob,
  canSubmitReview,
  jobCompleted,
  hasReview,
}: ChatJobActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [completeError, setCompleteError] = useState<string | null>(null);

  if (!canCompleteJob && !canSubmitReview && !jobCompleted) {
    return null;
  }

  return (
    <div className="mb-6 space-y-4">
      {canCompleteJob && (
        <div className="rounded-xl border border-zinc-700 bg-zinc-900/60 p-4">
          <p className="text-sm text-zinc-300">
            Elkészült a munka? Jelöld késznek, majd értékeld a fusizót.
          </p>
          {completeError && (
            <p className="mt-2 text-sm text-red-400" role="alert">
              {completeError}
            </p>
          )}

          <button
            type="button"
            disabled={isPending}
            onClick={() => {
              setCompleteError(null);
              startTransition(async () => {
                const result = await completeJob(jobId);
                if (result.success) {
                  router.refresh();
                } else if (result.error) {
                  setCompleteError(result.error);
                }
              });
            }}
            className={`mt-3 ${btnSecondaryClassName}`}
          >
            {isPending ? "Mentés…" : "Munka elkészültnek jelölés"}
          </button>
        </div>
      )}

      {jobCompleted && hasReview && (
        <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          Köszönjük! Már értékelted ezt a munkát.
        </p>
      )}

      {canSubmitReview && (
        <ReviewForm
          jobId={jobId}
          craftsmanId={craftsmanId}
          craftsmanName={craftsmanName}
        />
      )}
    </div>
  );
}
