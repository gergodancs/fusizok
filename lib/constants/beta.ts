/** localStorage kulcs – növeld a verziót, ha új üzenetet akarsz megjeleníteni mindenkinek. */
export const BETA_NOTICE_STORAGE_KEY = "fusizok-beta-notice-v1";

/**
 * Közösségi tag-számláló banner (főoldal, login).
 * Induláskor kikapcsolva – alacsony számok bizalomrombolók. Később: true.
 */
export const SHOW_PLATFORM_STATS_BANNER = false;

/** Új fusizók 100 kredit akció vége (ISO 8601, magyar idő). */
export const SIGNUP_CREDITS_PROMO_ENDS_AT = "2026-07-07T23:59:59+02:00";

export const BETA_NOTICE = {
  icon: "🚀",
  title: "Tesztidőszak – köszönjük a bizalmat!",
  body: "A fusizok.hu jelenleg béta üzemmódban fut. Köszönjük, hogy az oldal használatával támogatod a fejlesztést! Előfordulhatnak hibák vagy változások – a visszajelzéseid segítenek jobbá tenni a platformot.",
  dismissLabel: "Értem, folytatom",
} as const;
