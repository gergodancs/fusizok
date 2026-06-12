"use server";

import { revalidatePath } from "next/cache";
import { CRAFTSMAN_BIO_MAX_LENGTH } from "@/lib/chat-payment/constants";
import {
  parseMainCategoriesFromForm,
  parseSubCategoriesFromForm,
  validateCraftsmanCategorySelection,
} from "@/lib/categories/parse-form";
import {
  parseCoverageAreasFromForm,
  parseLocationFromFormData,
  parseServiceRadiusKm,
} from "@/lib/location/parse-location-form";
import { persistCraftsmanLocation } from "@/lib/location/persist-location";
import { isPioneerZoneForCraftsman } from "@/lib/zone-activity";
import { getSessionUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export type CraftsmanProfileFormState = {
  success?: boolean;
  pioneerZone?: boolean;
  error?: string;
};

export async function updateCraftsmanProfile(
  _prevState: CraftsmanProfileFormState,
  formData: FormData,
): Promise<CraftsmanProfileFormState> {
  const user = await getSessionUser();

  if (!user) {
    return { error: "Bejelentkezés szükséges." };
  }

  const mainCategoryIds = parseMainCategoriesFromForm(formData);
  const subCategories = parseSubCategoriesFromForm(formData);
  const categoryError = validateCraftsmanCategorySelection(
    mainCategoryIds,
    subCategories,
  );

  if (categoryError) {
    return { error: categoryError };
  }

  const location = parseLocationFromFormData(formData);
  const serviceRadiusKm = parseServiceRadiusKm(formData);

  if (!location) {
    return {
      error:
        "Add meg a szolgáltatási bázist: válaszd ki a megyét és települést.",
    };
  }

  const coverageAreas = parseCoverageAreasFromForm(formData);

  if (location.county === "Budapest" && coverageAreas.length === 0) {
    return {
      error: "Budapestnél jelölj be legalább egy kerületet, ahol vállalsz munkát.",
    };
  }

  const bioRaw = (formData.get("bio") as string) ?? "";
  const bio = bioRaw.trim() || null;

  if (bio && bio.length > CRAFTSMAN_BIO_MAX_LENGTH) {
    return {
      error: `A bemutatkozás legfeljebb ${CRAFTSMAN_BIO_MAX_LENGTH} karakter lehet.`,
    };
  }

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("craftsman_profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  const profilePayload = {
    profession: mainCategoryIds.join(", "),
    sub_categories: subCategories,
    bio,
  };

  const { error } = existing
    ? await supabase
        .from("craftsman_profiles")
        .update(profilePayload)
        .eq("id", user.id)
    : await supabase.from("craftsman_profiles").insert({
        id: user.id,
        ...profilePayload,
        coverage_counties: [],
        coverage_zip_codes: [],
      });

  if (error) {
    console.error("Fusizó profil mentési hiba:", error.message);
    return { error: "A profil mentése sikertelen. Próbáld újra." };
  }

  const resolved = await persistCraftsmanLocation(
    supabase,
    user.id,
    location,
    serviceRadiusKm,
    location.county === "Budapest" ? coverageAreas : undefined,
  );

  const pioneerZone = await isPioneerZoneForCraftsman(
    resolved,
    serviceRadiusKm,
  );

  revalidatePath("/szaki");
  revalidatePath("/szaki/profil");
  revalidatePath(`/lakos/fusizo/${user.id}`);
  return { success: true, pioneerZone };
}
