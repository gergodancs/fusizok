"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth/session";
import { countCraftsmanPortfolioImages } from "@/lib/portfolio";
import { PORTFOLIO_MAX_IMAGES } from "@/lib/storage/image-constraints";
import { uploadPortfolioImage } from "@/lib/storage/upload-portfolio-image";
import { createClient } from "@/lib/supabase/server";

export type PortfolioActionState = {
  success?: boolean;
  error?: string;
};

export async function uploadPortfolioImageAction(
  _prevState: PortfolioActionState,
  formData: FormData,
): Promise<PortfolioActionState> {
  const user = await getSessionUser();
  if (!user) {
    return { error: "Bejelentkezés szükséges." };
  }

  const file = formData.get("image") as File | null;
  if (!file || !(file instanceof File) || !file.size) {
    return { error: "Válassz ki egy képet." };
  }

  const count = await countCraftsmanPortfolioImages(user.id);
  if (count >= PORTFOLIO_MAX_IMAGES) {
    return {
      error: `Legfeljebb ${PORTFOLIO_MAX_IMAGES} referenciaképet tölthetsz fel.`,
    };
  }

  const { url, error: uploadError } = await uploadPortfolioImage(file, user.id);
  if (uploadError || !url) {
    return { error: uploadError ?? "A feltöltés sikertelen." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("portfolio_images").insert({
    craftsman_id: user.id,
    image_url: url,
  });

  if (error) {
    console.error("Portfólió mentési hiba:", error.message);
    return { error: "A galéria mentése sikertelen." };
  }

  revalidatePath("/szaki/profil");
  revalidatePath(`/lakos/fusizo/${user.id}`);
  return { success: true };
}

export async function deletePortfolioImageAction(
  imageId: string,
): Promise<PortfolioActionState> {
  const user = await getSessionUser();
  if (!user) {
    return { error: "Bejelentkezés szükséges." };
  }

  const supabase = await createClient();

  const { data: image } = await supabase
    .from("portfolio_images")
    .select("id, craftsman_id, image_url")
    .eq("id", imageId)
    .maybeSingle();

  if (!image || image.craftsman_id !== user.id) {
    return { error: "A kép nem található." };
  }

  const { error } = await supabase
    .from("portfolio_images")
    .delete()
    .eq("id", imageId);

  if (error) {
    console.error("Portfólió törlési hiba:", error.message);
    return { error: "A kép törlése sikertelen." };
  }

  revalidatePath("/szaki/profil");
  revalidatePath(`/lakos/fusizo/${user.id}`);
  return { success: true };
}
