"use client";

import { useActionState, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  deletePortfolioImageAction,
  uploadPortfolioImageAction,
  type PortfolioActionState,
} from "@/app/actions/portfolio";
import Image from "next/image";
import type { PortfolioImage } from "@/lib/types/portfolio";
import { PORTFOLIO_MAX_IMAGES } from "@/lib/storage/image-constraints";
import { btnSecondaryClassName, labelClassName } from "@/lib/ui-classes";

const initialState: PortfolioActionState = {};

type PortfolioManagerProps = {
  images: PortfolioImage[];
};

export function PortfolioManager({ images }: PortfolioManagerProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, formAction, isPending] = useActionState(
    uploadPortfolioImageAction,
    initialState,
  );
  const [isDeleting, startDelete] = useTransition();

  useEffect(() => {
    if (state.success) {
      router.refresh();
      if (inputRef.current) inputRef.current.value = "";
    }
  }, [state.success, router]);

  const canUpload = images.length < PORTFOLIO_MAX_IMAGES;

  return (
    <div className="space-y-4">
      <div>
        <span className={labelClassName}>Referencia galéria</span>
        <p className="mt-1 text-sm text-zinc-500">
          Mutasd be korábbi munkáidat ({images.length}/{PORTFOLIO_MAX_IMAGES}{" "}
          kép).
        </p>
      </div>

      {canUpload && (
        <form action={formAction} className="sr-only" aria-hidden>
          <input
            ref={inputRef}
            type="file"
            name="image"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                e.target.form?.requestSubmit();
              }
            }}
          />
        </form>
      )}

      {state.error && (
        <p className="text-sm text-red-400" role="alert">
          {state.error}
        </p>
      )}

      {images.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((image) => (
            <div
              key={image.id}
              className="group relative aspect-square overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900"
            >
              <Image
                src={image.image_url}
                alt="Referencia munka"
                fill
                className="object-cover"
                sizes="200px"
                unoptimized
              />
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => {
                  startDelete(async () => {
                    await deletePortfolioImageAction(image.id);
                    router.refresh();
                  });
                }}
                className="absolute right-2 top-2 rounded-lg bg-zinc-950/80 px-2 py-1 text-xs font-medium text-red-300 opacity-0 transition group-hover:opacity-100 hover:bg-red-950/90"
              >
                Törlés
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-zinc-700 px-4 py-8 text-center text-sm text-zinc-500">
          Még nincs feltöltött referenciakép. Tölts fel munkáidról fotókat a
          bizalom építéséhez!
        </p>
      )}

      {!canUpload && (
        <p className="text-sm text-zinc-500">
          Elérted a maximális képszámot. Törölj egy képet új feltöltéshez.
        </p>
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={!canUpload || isPending}
        className={btnSecondaryClassName}
      >
        {isPending ? "Feltöltés…" : "Új kép hozzáadása"}
      </button>
    </div>
  );
}
