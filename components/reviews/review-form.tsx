"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { submitReview, type ReviewFormState } from "@/app/actions/reviews";
import {
  btnPrimaryClassName,
  inputClassName,
  labelClassName,
} from "@/lib/ui-classes";

const initialState: ReviewFormState = {};

type ReviewFormProps = {
  jobId: string;
  craftsmanId: string;
  craftsmanName: string;
};

export function ReviewForm({
  jobId,
  craftsmanId,
  craftsmanName,
}: ReviewFormProps) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [state, formAction, isPending] = useActionState(
    submitReview,
    initialState,
  );

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [state.success, router]);

  const displayRating = hoverRating || rating;

  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5">
      <h3 className="font-bold text-zinc-100">
        Értékeld {craftsmanName} munkáját
      </h3>
      <p className="mt-1 text-sm text-zinc-400">
        A véleményed segít más lakosoknak dönteni.
      </p>

      <form action={formAction} className="mt-4 space-y-4">
        <input type="hidden" name="job_id" value={jobId} />
        <input type="hidden" name="craftsman_id" value={craftsmanId} />
        <input type="hidden" name="rating" value={rating} />

        <div>
          <span className={labelClassName}>Csillagok</span>
          <div className="mt-2 flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className={`text-2xl transition ${
                  star <= displayRating ? "text-amber-400" : "text-zinc-600"
                }`}
                aria-label={`${star} csillag`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="review-comment" className={labelClassName}>
            Vélemény (opcionális)
          </label>
          <textarea
            id="review-comment"
            name="comment"
            rows={3}
            placeholder="Milyen volt a munka minősége, pontosság, kommunikáció?"
            className={`mt-2 ${inputClassName}`}
          />
        </div>

        <div>
          <label htmlFor="review-image" className={labelClassName}>
            Fotó a munkáról (opcionális)
          </label>
          <input
            id="review-image"
            type="file"
            name="review_image"
            accept="image/jpeg,image/png,image/webp"
            className="mt-2 block w-full text-sm text-zinc-400 file:mr-4 file:rounded-lg file:border-0 file:bg-zinc-700 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-zinc-200 hover:file:bg-zinc-600"
          />
        </div>

        {state.error && (
          <p className="text-sm text-red-400" role="alert">
            {state.error}
          </p>
        )}

        {state.success && (
          <p className="text-sm text-emerald-400" role="status">
            Köszönjük az értékelést!
          </p>
        )}

        <button
          type="submit"
          disabled={isPending || rating < 1}
          className={btnPrimaryClassName}
        >
          {isPending ? "Küldés…" : "Értékelés beküldése"}
        </button>
      </form>
    </div>
  );
}
