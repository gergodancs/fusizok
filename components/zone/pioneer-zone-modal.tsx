"use client";

import { useEffect } from "react";
import { btnPrimaryClassName } from "@/lib/ui-classes";

export type PioneerZoneVariant = "craftsman" | "client";

type PioneerZoneModalProps = {
  open: boolean;
  variant: PioneerZoneVariant;
  onClose: () => void;
};

const COPY: Record<
  PioneerZoneVariant,
  { icon: string; title: string; body: string }
> = {
  craftsman: {
    icon: "🧭",
    title: "Üdvözlünk a Fusizók között!",
    body: "Úgy látjuk, a környékeden te vagy az egyik első úttörő szakemberünk. Ne csüggedj, gőzerővel kampányolunk a környéken! Amint egy lakos munkát hirdet meg a vállalási körzetedben, azonnal küldünk neked egy e-mail értesítést a Resend-en keresztül. Köszönjük a bizalmadat!",
  },
  client: {
    icon: "🚀",
    title: "Hirdetésedet sikeresen rögzítettük!",
    body: "A közvetlen környezetedben jelenleg még nincs szabad szaki, de az oldal napról napra növekszik. Amint egy szakembernek megtetszik a feladat és ajánlatot tesz, vagy chatet indít veled, azonnal küldünk e-mail értesítést!",
  },
};

export function PioneerZoneModal({
  open,
  variant,
  onClose,
}: PioneerZoneModalProps) {
  const content = COPY[variant];

  useEffect(() => {
    if (!open) return;

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
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm"
        aria-label="Bezárás"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pioneer-zone-title"
        className="relative w-full max-w-md rounded-2xl border border-amber-500/30 bg-zinc-900 p-6 shadow-2xl shadow-black/50 sm:p-8"
      >
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/15 text-3xl ring-8 ring-amber-500/10">
          <span aria-hidden>{content.icon}</span>
        </div>

        <h2
          id="pioneer-zone-title"
          className="text-center text-xl font-bold tracking-tight text-zinc-50"
        >
          {content.title}
        </h2>

        <p className="mt-4 text-center text-sm leading-relaxed text-zinc-300">
          {content.body}
        </p>

        <button
          type="button"
          onClick={onClose}
          className={`mt-6 w-full ${btnPrimaryClassName}`}
        >
          Rendben, köszönöm!
        </button>
      </div>
    </div>
  );
}
