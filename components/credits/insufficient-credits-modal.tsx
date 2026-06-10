"use client";

import { Coins, X } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { BID_CREDIT_COST } from "@/lib/credits/constants";
import { btnPrimaryClassName, btnSecondaryClassName } from "@/lib/ui-classes";

type InsufficientCreditsModalProps = {
  onClose: () => void;
};

export function InsufficientCreditsModal({
  onClose,
}: InsufficientCreditsModalProps) {
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
        aria-labelledby="insufficient-credits-title"
        className="relative w-full max-w-md rounded-2xl border border-amber-500/30 bg-zinc-900 p-6 shadow-2xl"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-amber-500/15 p-2">
              <Coins className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <h2
                id="insufficient-credits-title"
                className="text-xl font-bold text-zinc-50"
              >
                Nincs elég kredited
              </h2>
              <p className="mt-2 text-sm text-zinc-400">
                Nincs elég kredited a pályázathoz! Töltsd fel az egyenleged a
                továbblépéshez. Egy pályázat {BID_CREDIT_COST} kreditbe kerül.
              </p>
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

        <div className="flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className={btnSecondaryClassName}
          >
            Mégse
          </button>
          <Link href="/szaki/kreditek" className={btnPrimaryClassName}>
            Kreditvásárlás
          </Link>
        </div>
      </div>
    </div>
  );
}
