"use server";

import { CRAFTSMAN_BIO_MAX_LENGTH } from "@/lib/chat-payment/constants";
import {
  parseLocationFromFormData,
  parseServiceRadiusKm,
} from "@/lib/location/parse-location-form";
import { persistCraftsmanLocation } from "@/lib/location/persist-location";
import { revalidatePath } from "next/cache";
import { JOB_CATEGORIES, type JobCategory } from "@/lib/job-categories";
import { getSessionUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export type CraftsmanProfileFormState = {
  success?: boolean;
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

  const selectedCategories = formData
    .getAll("categories")
    .map((v) => (v as string).trim())
    .filter((v) => JOB_CATEGORIES.includes(v as JobCategory));

  const location = parseLocationFromFormData(formData);
  const serviceRadiusKm = parseServiceRadiusKm(formData);

  if (selectedCategories.length === 0) {
    return { error: "Válassz legalább egy kategóriát." };
  }

  if (!location) {
    return {
      error:
        "Add meg a helyszínt GPS-sel vagy válaszd ki kézzel a megyét és települést.",
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

  const { error } = await supabase.from("craftsman_profiles").upsert(
    {
      id: user.id,
      profession: selectedCategories.join(", "),
      bio,
    },
    { onConflict: "id" },
  );

  if (error) {
    console.error("Fusizó profil mentési hiba:", error.message);
    return { error: "A profil mentése sikertelen. Próbáld újra." };
  }

  await persistCraftsmanLocation(
    supabase,
    user.id,
    location,
    serviceRadiusKm,
  );

  revalidatePath("/szaki");
  revalidatePath("/szaki/profil");
  revalidatePath(`/lakos/fusizo/${user.id}`);
  return { success: true };
}
