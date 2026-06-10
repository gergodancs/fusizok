"use server";

import { revalidatePath } from "next/cache";
import { requireCraftsman } from "@/lib/auth/require-craftsman";
import { uploadKycDocument } from "@/lib/storage/upload-kyc-document";
import { createClient } from "@/lib/supabase/server";

export type SubmitKycState = {
  error?: string;
  success?: boolean;
};

export async function submitKycVerification(
  _prevState: SubmitKycState,
  formData: FormData,
): Promise<SubmitKycState> {
  const { user } = await requireCraftsman("/szaki/profil");

  const idFile = formData.get("id_document") as File | null;
  const selfieFile = formData.get("selfie") as File | null;

  if (!idFile?.size || !selfieFile?.size) {
    return { error: "Töltsd fel a személyigazolvány fotóját és az arcképet is." };
  }

  const supabase = await createClient();

  const { data: craftsman } = await supabase
    .from("craftsman_profiles")
    .select("kyc_status")
    .eq("id", user.id)
    .maybeSingle();

  if (craftsman?.kyc_status === "pending") {
    return { error: "A hitelesítési kérelmed már feldolgozás alatt van." };
  }

  if (craftsman?.kyc_status === "approved") {
    return { error: "A profilod már hitelesített." };
  }

  const [idUpload, selfieUpload] = await Promise.all([
    uploadKycDocument(idFile, user.id, "id"),
    uploadKycDocument(selfieFile, user.id, "selfie"),
  ]);

  if (idUpload.error) {
    return { error: idUpload.error };
  }
  if (selfieUpload.error) {
    return { error: selfieUpload.error };
  }

  const { error } = await supabase
    .from("craftsman_profiles")
    .update({
      kyc_status: "pending",
      kyc_id_path: idUpload.path,
      kyc_selfie_path: selfieUpload.path,
      kyc_submitted_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    console.error("[submitKyc] Mentési hiba:", error.message);
    return { error: "A hitelesítési kérelem mentése sikertelen." };
  }

  revalidatePath("/szaki/profil");
  return { success: true };
}
