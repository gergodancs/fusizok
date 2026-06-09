"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth/session";
import { uploadAvatar } from "@/lib/storage/upload-avatar";
import { createClient } from "@/lib/supabase/server";

export type AvatarUploadState = {
  success?: boolean;
  error?: string;
  avatarUrl?: string;
};

export async function uploadProfileAvatar(
  _prevState: AvatarUploadState,
  formData: FormData,
): Promise<AvatarUploadState> {
  const user = await getSessionUser();
  if (!user) {
    return { error: "Bejelentkezés szükséges." };
  }

  const file = formData.get("avatar") as File | null;
  if (!file || !(file instanceof File) || !file.size) {
    return { error: "Válassz ki egy képet." };
  }

  const { url, error: uploadError } = await uploadAvatar(file, user.id);
  if (uploadError || !url) {
    return { error: uploadError ?? "A feltöltés sikertelen." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: url })
    .eq("id", user.id);

  if (error) {
    console.error("Profilkép mentési hiba:", error.message);
    return { error: "A profilkép mentése sikertelen." };
  }

  revalidatePath("/szaki/profil");
  revalidatePath("/lakos/profil");
  revalidatePath(`/lakos/fusizo/${user.id}`);
  revalidatePath("/szaki", "layout");
  revalidatePath("/lakos", "layout");

  return { success: true, avatarUrl: url };
}
