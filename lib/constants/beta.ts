/** localStorage kulcs – növeld a verziót, ha új üzenetet akarsz megjeleníteni mindenkinek. */
export const BETA_NOTICE_STORAGE_KEY = "fusizok-beta-notice-v1";

export const BETA_NOTICE = {
  icon: "🚀",
  title: "Tesztidőszak – köszönjük a bizalmat!",
  body: "A fusizok.hu jelenleg béta üzemmódban fut. Köszönjük, hogy az oldal használatával támogatod a fejlesztést! Előfordulhatnak hibák vagy változások – a visszajelzéseid segítenek jobbá tenni a platformot.",
  dismissLabel: "Értem, folytatom",
} as const;
