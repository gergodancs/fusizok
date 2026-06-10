import { SIGNUP_CREDITS_PROMO_ENDS_AT } from "@/lib/constants/beta";

export type PromoCountdown = {
  expired: boolean;
  days: number;
  hours: number;
  minutes: number;
  label: string;
  shortLabel: string;
};

export function getPromoCountdown(
  endsAtIso: string = SIGNUP_CREDITS_PROMO_ENDS_AT,
  now: Date = new Date(),
): PromoCountdown {
  const end = new Date(endsAtIso);
  const diffMs = end.getTime() - now.getTime();

  if (Number.isNaN(end.getTime()) || diffMs <= 0) {
    return {
      expired: true,
      days: 0,
      hours: 0,
      minutes: 0,
      label: "Az induló kredit akció lejárt",
      shortLabel: "Lejárt",
    };
  }

  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return {
      expired: false,
      days,
      hours,
      minutes,
      label: `${days} nap ${hours} óra`,
      shortLabel: `${days} nap`,
    };
  }

  if (hours > 0) {
    return {
      expired: false,
      days,
      hours,
      minutes,
      label: `${hours} óra ${minutes} perc`,
      shortLabel: `${hours} óra`,
    };
  }

  return {
    expired: false,
    days,
    hours,
    minutes,
    label: `${minutes} perc`,
    shortLabel: `${minutes} perc`,
  };
}

export function formatPromoEndDate(
  endsAtIso: string = SIGNUP_CREDITS_PROMO_ENDS_AT,
): string {
  const end = new Date(endsAtIso);
  if (Number.isNaN(end.getTime())) {
    return "";
  }

  return end.toLocaleDateString("hu-HU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
