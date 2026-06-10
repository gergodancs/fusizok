const PROFANITY_PATTERNS: RegExp[] = [
  /\b(fasz|faszom|faszfej|faszkalap|kurva|kurv[aá]nyad|bassza|basszameg|geci|gecifej|picsa|pina|segg|szar|szarh[aá]zi|buzi|ribanc)\b/giu,
  /\b(fuck|fucking|fucker|shit|shitty|bitch|asshole|bastard|cunt|dick|pussy)\b/giu,
];

export function containsProfanity(text: string): boolean {
  const normalized = text.normalize("NFD").replace(/\p{M}/gu, "");
  return PROFANITY_PATTERNS.some((pattern) => {
    pattern.lastIndex = 0;
    return pattern.test(normalized);
  });
}

export const PROFANITY_WARNING =
  "Kérjük, ügyelj a kulturált hangnemre! Az üzeneted durva kifejezéseket tartalmaz.";
