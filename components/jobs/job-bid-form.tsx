"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { createJobBid, type BidFormState } from "@/app/actions/bids";
import { InsufficientCreditsModal } from "@/components/credits/insufficient-credits-modal";
import { AVAILABILITY_OPTIONS } from "@/lib/availability-options";
import { isBetaCreditRefillActive } from "@/lib/constants/beta";
import { formatCreditAmount, formatCreditBalance } from "@/lib/credits/format";
import { btnPrimaryClassName, inputClassName, labelClassName } from "@/lib/ui-classes";

const initialState: BidFormState = {};

type JobBidFormProps = {
  jobId: string;
  jobTitle: string;
  creditBalance: number;
  bidCreditCost: number;
};

export function JobBidForm({
  jobId,
  jobTitle,
  creditBalance,
  bidCreditCost,
}: JobBidFormProps) {
  const [state, formAction, isPending] = useActionState(
    createJobBid,
    initialState,
  );
  const [showInsufficientModal, setShowInsufficientModal] = useState(false);

  const hasEnoughCredits = creditBalance >= bidCreditCost;
  const betaRefillActive = isBetaCreditRefillActive();
  const canSubmitBid = hasEnoughCredits || betaRefillActive;
  const bidCostLabel = formatCreditAmount(bidCreditCost);

  useEffect(() => {
    if (state.insufficientCredits) {
      setShowInsufficientModal(true);
    }
  }, [state.insufficientCredits]);

  if (state.success) {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center">
        <h3 className="text-lg font-bold text-emerald-300">Pályázat elküldve!</h3>
        <p className="mt-2 text-sm text-zinc-400">
          A(z) „{jobTitle}” munkára sikeresen pályáztál ({bidCostLabel}{" "}
          kredit levonva).
        </p>
        <p className="mt-4 text-sm text-zinc-500">
          A megrendelő értesítést kap az ajánlatodról. A chat akkor nyílik meg,
          ha elfogadja az ajánlatodat.
        </p>
        <Link href="/szaki/aktivitas" className={`mt-6 inline-block ${btnPrimaryClassName}`}>
          Aktivitásom
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-700 bg-zinc-900/50 px-4 py-3 text-sm">
        <span className="text-zinc-400">
          Egyenleged:{" "}
          <span className="font-semibold text-amber-400">
            {formatCreditBalance(creditBalance)}
          </span>
        </span>
        <Link
          href="/szaki/kreditek"
          className="font-medium text-amber-400 hover:text-amber-300"
        >
          {betaRefillActive ? "Kreditek →" : "Kreditvásárlás →"}
        </Link>
      </div>

      {!hasEnoughCredits && betaRefillActive && (
        <div
          role="status"
          className="mb-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200"
        >
          Béta tesztidőszakban a kredited automatikusan feltöltődik pályázáskor,
          ha elfogy – nyugodtan küldheted az ajánlatod.
        </div>
      )}

      {!hasEnoughCredits && !betaRefillActive && (
        <div
          role="alert"
          className="mb-5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200"
        >
          Nincs elég kredited a pályázathoz ({bidCostLabel} kredit szükséges).
          Töltsd fel az egyenleged a továbblépéshez.
        </div>
      )}

      <form action={formAction} className="space-y-5">
        <input type="hidden" name="job_id" value={jobId} />

        {state.error && !state.insufficientCredits && (
          <div
            role="alert"
            className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          >
            {state.error}
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="price" className={labelClassName}>
            Hozzávetőleges ár (Ft){" "}
            <span className="font-normal text-zinc-500">– nem kötelező</span>
          </label>
          <input
            id="price"
            name="price"
            type="number"
            min={0}
            step={100}
            placeholder="pl. 15000"
            className={inputClassName}
            disabled={!canSubmitBid}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="availability_duration" className={labelClassName}>
            Vállalási idő
          </label>
          <select
            id="availability_duration"
            name="availability_duration"
            required
            defaultValue=""
            className={inputClassName}
            disabled={!canSubmitBid}
          >
            <option value="" disabled>
              Válassz időpontot…
            </option>
            {AVAILABILITY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="message" className={labelClassName}>
            Üzenet a megrendelőnek
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            placeholder="pl. Van profi fúróm, szombaton ráérek."
            className={`${inputClassName} resize-y`}
            disabled={!canSubmitBid}
          />
        </div>

        <button
          type="submit"
          disabled={isPending || !canSubmitBid}
          className={`w-full ${btnPrimaryClassName}`}
        >
          {isPending
            ? "Küldés…"
            : `Pályázat elküldése (${bidCostLabel} kredit)`}
        </button>
      </form>

      {showInsufficientModal && (
        <InsufficientCreditsModal
          bidCreditCost={bidCreditCost}
          onClose={() => setShowInsufficientModal(false)}
        />
      )}
    </>
  );
}
