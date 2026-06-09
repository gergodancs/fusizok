import {
  AVATAR_ALLOWED_TYPES,
  IMAGE_MAX_SIZE_BYTES,
} from "@/lib/storage/image-constraints";
import { uploadImageToStorage } from "@/lib/storage/upload-image";

const BUCKET = "avatars";

export async function uploadAvatar(
  file: File,
  userId: string,
): Promise<{ url?: string; error?: string }> {
  if (file.size > IMAGE_MAX_SIZE_BYTES) {
    return { error: "A profilkép legfeljebb 5 MB lehet." };
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${userId}/avatar.${ext}`;

  return uploadImageToStorage({
    bucket: BUCKET,
    path,
    file,
    allowedTypes: AVATAR_ALLOWED_TYPES,
    upsert: true,
  });
}
