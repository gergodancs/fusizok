"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createJobBid, type BidFormState } from "@/app/actions/bids";
import { AVAILABILITY_OPTIONS } from "@/lib/availability-options";
import { btnPrimaryClassName, inputClassName, labelClassName } from "@/lib/ui-classes";

const initialState: BidFormState = {};

type JobBidFormProps = {
  jobId: string;
  jobTitle: string;
};

export function JobBidForm({ jobId, jobTitle }: JobBidFormProps) {
  const [state, formAction, isPending] = useActionState(
    createJobBid,
    initialState,
  );

  if (state.success) {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center">
        <h3 className="text-lg font-bold text-emerald-300">Pályázat elküldve!</h3>
        <p className="mt-2 text-sm text-zinc-400">
          A(z) „{jobTitle}” munkára sikeresen pályáztál.
        </p>
        <p className="mt-4 text-sm text-zinc-500">
          A megrendelő értesítést kap az ajánlatodról. A chat akkor nyílik meg,
          ha megosztja veled a kapcsolatot.
        </p>
        <Link href="/szaki/aktivitas" className={`mt-6 inline-block ${btnPrimaryClassName}`}>
          Aktivitásom
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="job_id" value={jobId} />

      {state.error && (
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
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className={`w-full ${btnPrimaryClassName}`}
      >
        {isPending ? "Küldés…" : "Pályázat beküldése"}
      </button>
    </form>
  );
}
