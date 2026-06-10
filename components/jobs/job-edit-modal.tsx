"use client";

import { Loader2, X } from "lucide-react";
import { useActionState, useEffect } from "react";
import { updateJob, type JobMutationState } from "@/app/actions/jobs";
import { HybridLocationPicker } from "@/components/location/hybrid-location-picker";
import type { Job } from "@/lib/types/job";
import {
  btnPrimaryClassName,
  btnSecondaryClassName,
  inputClassName,
  labelClassName,
} from "@/lib/ui-classes";

const initialState: JobMutationState = {};

type JobEditModalProps = {
  job: Job;
  onClose: () => void;
  onSuccess: () => void;
};

export function JobEditModal({ job, onClose, onSuccess }: JobEditModalProps) {
  const [state, formAction, isPending] = useActionState(
    updateJob,
    initialState,
  );

  useEffect(() => {
    if (state.success) {
      onSuccess();
      onClose();
    }
  }, [state.success, onClose, onSuccess]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm"
        aria-label="Bezárás"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="job-edit-title"
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 id="job-edit-title" className="text-xl font-bold text-zinc-50">
            Hirdetés szerkesztése
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-200"
            aria-label="Bezárás"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form action={formAction} className="space-y-5">
          <input type="hidden" name="job_id" value={job.id} />

          {state.error && (
            <div
              role="alert"
              className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
            >
              {state.error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="edit-title" className={labelClassName}>
              Munka megnevezése
            </label>
            <input
              id="edit-title"
              name="title"
              type="text"
              required
              defaultValue={job.title}
              className={inputClassName}
            />
          </div>

          <HybridLocationPicker
            label="Hol van a munka?"
            countyName={job.county ?? ""}
            cityName={job.city ?? job.zip_code ?? ""}
          />

          <div className="space-y-2">
            <label htmlFor="edit-description" className={labelClassName}>
              Részletes leírás
            </label>
            <textarea
              id="edit-description"
              name="description"
              required
              rows={5}
              defaultValue={job.description}
              className={`${inputClassName} resize-y`}
            />
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className={btnSecondaryClassName}
            >
              Mégsem
            </button>
            <button
              type="submit"
              disabled={isPending}
              className={`inline-flex items-center justify-center gap-2 ${btnPrimaryClassName}`}
            >
              {isPending && (
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} />
              )}
              {isPending ? "Mentés…" : "Mentés"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
