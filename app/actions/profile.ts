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

export type ProfileUpdateState = {
  success?: boolean;
  error?: string;
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

export async function updateProfile(
  _prevState: ProfileUpdateState,
  formData: FormData,
): Promise<ProfileUpdateState> {
  const user = await getSessionUser();
  if (!user) {
    return { error: "Bejelentkezés szükséges." };
  }

  const fullName = (formData.get("full_name") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim() || null;

  if (!fullName) {
    return { error: "Kérjük, adja meg a teljes nevét." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      phone,
    })
    .eq("id", user.id);

  if (error) {
    console.error("Profil mentési hiba:", error.message);
    return { error: "A profil mentése sikertelen." };
  }

  await supabase.auth.updateUser({
    data: { full_name: fullName },
  });

  revalidatePath("/szaki/profil");
  revalidatePath("/lakos/profil");
  revalidatePath("/szaki", "layout");
  revalidatePath("/lakos", "layout");

  return { success: true };
}
