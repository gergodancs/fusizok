"use client";

import { Flag, Loader2, X } from "lucide-react";
import { useActionState, useEffect } from "react";
import {
  submitReport,
  type ReportReason,
  type SubmitReportState,
} from "@/app/actions/reports";
import {
  btnPrimaryClassName,
  btnSecondaryClassName,
  inputClassName,
  labelClassName,
} from "@/lib/ui-classes";

const initialState: SubmitReportState = {};

const REASON_OPTIONS: { value: ReportReason; label: string }[] = [
  { value: "spam", label: "Spam" },
  { value: "harassment", label: "Zaklatás" },
  { value: "fraud", label: "Csalás" },
  { value: "other", label: "Egyéb" },
];

type ReportModalProps = {
  reportedUserId: string;
  reportedUserName?: string | null;
  contextType?: "chat" | "profile";
  contextId?: string;
  onClose: () => void;
};

export function ReportModal({
  reportedUserId,
  reportedUserName,
  contextType,
  contextId,
  onClose,
}: ReportModalProps) {
  const [state, formAction, isPending] = useActionState(
    submitReport,
    initialState,
  );

  useEffect(() => {
    if (state.success) {
      onClose();
    }
  }, [state.success, onClose]);

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
        aria-labelledby="report-modal-title"
        className="relative w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-red-500/15 p-2">
              <Flag className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <h2
                id="report-modal-title"
                className="text-xl font-bold text-zinc-50"
              >
                Jelentés
              </h2>
              {reportedUserName && (
                <p className="mt-1 text-sm text-zinc-500">
                  {reportedUserName}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-200"
            aria-label="Bezárás"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {state.success ? (
          <p className="text-sm text-emerald-400">
            Köszönjük a jelentést! Csapatunk megvizsgálja.
          </p>
        ) : (
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="reported_user_id" value={reportedUserId} />
            {contextType && (
              <input type="hidden" name="context_type" value={contextType} />
            )}
            {contextId && (
              <input type="hidden" name="context_id" value={contextId} />
            )}

            <div>
              <label htmlFor="report-reason" className={labelClassName}>
                Ok
              </label>
              <select
                id="report-reason"
                name="reason"
                required
                className={`mt-1 w-full ${inputClassName}`}
                defaultValue=""
              >
                <option value="" disabled>
                  Válassz okot…
                </option>
                {REASON_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="report-details" className={labelClassName}>
                Rövid indoklás (opcionális)
              </label>
              <textarea
                id="report-details"
                name="details"
                rows={3}
                maxLength={500}
                placeholder="Írd le röviden, mi történt…"
                className={`mt-1 w-full resize-none ${inputClassName}`}
              />
            </div>

            {state.error && (
              <p className="text-sm text-red-400">{state.error}</p>
            )}

            <div className="flex flex-wrap justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className={btnSecondaryClassName}
              >
                Mégse
              </button>
              <button
                type="submit"
                disabled={isPending}
                className={btnPrimaryClassName}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                    Küldés…
                  </>
                ) : (
                  "Jelentés elküldése"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
