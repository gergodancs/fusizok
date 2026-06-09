import {
  IMAGE_MAX_SIZE_BYTES,
  REVIEW_IMAGE_ALLOWED_TYPES,
} from "@/lib/storage/image-constraints";
import { uploadImageToStorage } from "@/lib/storage/upload-image";

const BUCKET = "review-images";

export async function uploadReviewImage(
  file: File,
  userId: string,
  jobId: string,
): Promise<{ url?: string; error?: string }> {
  if (file.size > IMAGE_MAX_SIZE_BYTES) {
    return { error: "A fotó legfeljebb 5 MB lehet." };
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${userId}/${jobId}-${crypto.randomUUID()}.${ext}`;

  return uploadImageToStorage({
    bucket: BUCKET,
    path,
    file,
    allowedTypes: REVIEW_IMAGE_ALLOWED_TYPES,
  });
}
