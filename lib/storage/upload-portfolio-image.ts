import {
  IMAGE_MAX_SIZE_BYTES,
  PORTFOLIO_ALLOWED_TYPES,
} from "@/lib/storage/image-constraints";
import { uploadImageToStorage } from "@/lib/storage/upload-image";

const BUCKET = "portfolio-images";

export async function uploadPortfolioImage(
  file: File,
  craftsmanId: string,
): Promise<{ url?: string; error?: string }> {
  if (file.size > IMAGE_MAX_SIZE_BYTES) {
    return { error: "Egy kép legfeljebb 5 MB lehet." };
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${craftsmanId}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

  return uploadImageToStorage({
    bucket: BUCKET,
    path,
    file,
    allowedTypes: PORTFOLIO_ALLOWED_TYPES,
  });
}
