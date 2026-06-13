"use client";

import { useEffect, useState } from "react";
import { FeedbackLink } from "@/components/feedback/feedback-link";
import { BETA_NOTICE, BETA_NOTICE_STORAGE_KEY } from "@/lib/constants/beta";
import { btnPrimaryClassName } from "@/lib/ui-classes";

export function BetaLaunchModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(BETA_NOTICE_STORAGE_KEY);
      if (!dismissed) {
        setOpen(true);
      }
    } catch {
      setOpen(true);
    }
  }, []);

  function handleClose() {
    try {
      localStorage.setItem(BETA_NOTICE_STORAGE_KEY, "1");
    } catch {
      // localStorage nem elérhető – csak bezárjuk
    }
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        handleClose();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[110] flex items-end justify-center p-4 sm:items-center"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm"
        aria-label="Bezárás"
        onClick={handleClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="beta-notice-title"
        className="relative w-full max-w-md rounded-2xl border border-amber-500/30 bg-zinc-900 p-6 shadow-2xl shadow-black/50 sm:p-8"
      >
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/15 text-3xl ring-8 ring-amber-500/10">
          <span aria-hidden>{BETA_NOTICE.icon}</span>
        </div>

        <h2
          id="beta-notice-title"
          className="text-center text-xl font-bold text-zinc-50 sm:text-2xl"
        >
          {BETA_NOTICE.title}
        </h2>
        <p className="mt-4 text-center text-sm leading-relaxed text-zinc-400 sm:text-base">
          {BETA_NOTICE.body}
        </p>

        <div className="mt-4 text-center">
          <FeedbackLink label="Visszajelzés küldése" />
        </div>

        <button
          type="button"
          onClick={handleClose}
          className={`mt-6 w-full ${btnPrimaryClassName}`}
        >
          {BETA_NOTICE.dismissLabel}
        </button>
      </div>
    </div>
  );
}
