"use client";

import { useEffect, useState } from "react";
import {
  getPromoCountdown,
  type PromoCountdown,
} from "@/lib/beta/countdown";
import { SIGNUP_CREDITS_PROMO_ENDS_AT } from "@/lib/constants/beta";
import { CRAFTSMAN_SIGNUP_CREDITS } from "@/lib/credits/constants";

type BetaCountdownProps = {
  variant?: "modal" | "inline" | "badge";
};

export function BetaCountdown({ variant = "modal" }: BetaCountdownProps) {
  const [countdown, setCountdown] = useState<PromoCountdown>(() =>
    getPromoCountdown(SIGNUP_CREDITS_PROMO_ENDS_AT),
  );

  useEffect(() => {
    const tick = () => {
      setCountdown(getPromoCountdown(SIGNUP_CREDITS_PROMO_ENDS_AT));
    };

    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, []);

  if (countdown.expired) {
    return null;
  }

  if (variant === "badge") {
    return (
      <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-300">
        Béta · {countdown.shortLabel}
      </span>
    );
  }

  if (variant === "inline") {
    return (
      <p className="text-sm text-amber-300/90">
        Az induló {CRAFTSMAN_SIGNUP_CREDITS} kredit akcióig hátra:{" "}
        <span className="font-bold text-amber-300">{countdown.label}</span>
      </p>
    );
  }

  return (
    <div className="mt-4 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-center">
      <p className="text-xs font-semibold uppercase tracking-wide text-amber-400/90">
        Induló {CRAFTSMAN_SIGNUP_CREDITS} kredit akció
      </p>
      <p className="mt-1 text-lg font-bold text-amber-300">{countdown.label}</p>
      <p className="mt-1 text-xs text-zinc-500">
        Új fusizók regisztrációkor kapják – csak a béta időszakban.
      </p>
    </div>
  );
}
