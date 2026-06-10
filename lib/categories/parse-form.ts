import {
  getMainCategoryIdForSub,
  isValidMainCategoryId,
  isValidSubActivityKey,
  normalizeMainCategoryId,
} from "@/lib/constants/categories";

export function parseMainCategoriesFromForm(formData: FormData): string[] {
  const raw = formData
    .getAll("categories")
    .map((v) => normalizeMainCategoryId(String(v)))
    .filter((v): v is string => Boolean(v));

  return [...new Set(raw)];
}

export function parseSingleMainCategoryFromForm(
  formData: FormData,
): string | null {
  const raw = formData.get("category");
  if (!raw) return null;
  return normalizeMainCategoryId(String(raw));
}

export function parseSubCategoriesFromForm(formData: FormData): string[] {
  const raw = formData
    .getAll("sub_categories")
    .map((v) => String(v).trim())
    .filter(isValidSubActivityKey);

  return [...new Set(raw)];
}

export function validateCraftsmanCategorySelection(
  mainIds: string[],
  subKeys: string[],
): string | null {
  if (mainIds.length === 0) {
    return "Válassz legalább egy főkategóriát.";
  }

  if (subKeys.length === 0) {
    return "Válassz legalább egy konkrét tevékenységet.";
  }

  for (const sub of subKeys) {
    const parent = getMainCategoryIdForSub(sub);
    if (!parent || !mainIds.includes(parent)) {
      return "Minden al-tevékenységhez tartozó főkategóriát is jelölj be.";
    }
  }

  for (const mainId of mainIds) {
    const hasSubForMain = subKeys.some(
      (sub) => getMainCategoryIdForSub(sub) === mainId,
    );
    if (!hasSubForMain) {
      return "Minden kiválasztott főkategóriához válassz legalább egy al-tevékenységet.";
    }
  }

  return null;
}

export function validateJobCategorySelection(
  mainId: string | null,
  subKeys: string[],
): string | null {
  if (!mainId || !isValidMainCategoryId(mainId)) {
    return "Kérjük, válasszon főkategóriát.";
  }

  if (subKeys.length === 0) {
    return "Válassz legalább egy konkrét tevékenységet a feladathoz.";
  }

  const invalidSub = subKeys.find(
    (sub) => getMainCategoryIdForSub(sub) !== mainId,
  );
  if (invalidSub) {
    return "Az al-tevékenységeknek a kiválasztott főkategóriához kell tartozniuk.";
  }

  return null;
}
