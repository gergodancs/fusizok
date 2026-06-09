"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth/session";
import { uploadReviewImage } from "@/lib/storage/upload-review-image";
import { createClient } from "@/lib/supabase/server";

export type ReviewFormState = {
  success?: boolean;
  error?: string;
};

export async function submitReview(
  _prevState: ReviewFormState,
  formData: FormData,
): Promise<ReviewFormState> {
  const user = await getSessionUser();
  if (!user) {
    return { error: "Bejelentkezés szükséges." };
  }

  const jobId = (formData.get("job_id") as string)?.trim();
  const craftsmanId = (formData.get("craftsman_id") as string)?.trim();
  const ratingRaw = Number(formData.get("rating"));
  const comment = (formData.get("comment") as string)?.trim() || null;

  if (!jobId || !craftsmanId) {
    return { error: "Hiányzó adatok." };
  }

  if (!Number.isInteger(ratingRaw) || ratingRaw < 1 || ratingRaw > 5) {
    return { error: "Válassz 1–5 csillag közötti értékelést." };
  }

  const supabase = await createClient();

  const { data: job } = await supabase
    .from("jobs")
    .select("id, client_id, status")
    .eq("id", jobId)
    .maybeSingle();

  if (!job || job.client_id !== user.id) {
    return { error: "Nincs jogosultságod ehhez a munkához." };
  }

  if (job.status !== "completed") {
    return { error: "Az értékelés csak elkészült munkánál adható." };
  }

  const { data: bid } = await supabase
    .from("job_bids")
    .select("contact_shared, status")
    .eq("job_id", jobId)
    .eq("craftsman_id", craftsmanId)
    .maybeSingle();

  if (!bid?.contact_shared || bid.status !== "active") {
    return { error: "Csak megosztott kapcsolat után értékelhetsz." };
  }

  const { data: existing } = await supabase
    .from("reviews")
    .select("id")
    .eq("job_id", jobId)
    .eq("reviewer_id", user.id)
    .maybeSingle();

  if (existing) {
    return { error: "Ehhez a munkához már adtál értékelést." };
  }

  let imageUrl: string | null = null;
  const imageFile = formData.get("review_image") as File | null;
  if (imageFile && imageFile instanceof File && imageFile.size > 0) {
    const { url, error: uploadError } = await uploadReviewImage(
      imageFile,
      user.id,
      jobId,
    );
    if (uploadError) {
      return { error: uploadError };
    }
    imageUrl = url ?? null;
  }

  const { error } = await supabase.from("reviews").insert({
    job_id: jobId,
    reviewer_id: user.id,
    reviewee_id: craftsmanId,
    rating: ratingRaw,
    comment,
    image_url: imageUrl,
  });

  if (error) {
    console.error("Értékelés mentési hiba:", error.message);
    return { error: "Az értékelés mentése sikertelen." };
  }

  revalidatePath("/lakos/uzenetek");
  revalidatePath("/szaki/profil");
  return { success: true };
}
