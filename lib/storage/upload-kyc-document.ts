import { createClient } from "@/lib/supabase/server";
import {
  IMAGE_MAX_SIZE_BYTES,
  PORTFOLIO_ALLOWED_TYPES,
} from "@/lib/storage/image-constraints";

type KycDocumentKind = "id" | "selfie";

export async function uploadKycDocument(
  file: File,
  craftsmanId: string,
  kind: KycDocumentKind,
): Promise<{ path?: string; error?: string }> {
  if (!file.size) {
    return { error: "Válassz ki egy képet." };
  }

  if (file.size > IMAGE_MAX_SIZE_BYTES) {
    return { error: "A fájl túl nagy (max. 5 MB)." };
  }

  if (
    !PORTFOLIO_ALLOWED_TYPES.includes(
      file.type as (typeof PORTFOLIO_ALLOWED_TYPES)[number],
    )
  ) {
    return { error: "Csak JPG, PNG vagy WebP formátum engedélyezett." };
  }

  const ext = file.type.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
  const path = `${craftsmanId}/${kind}-${Date.now()}.${ext}`;

  const supabase = await createClient();
  const { error } = await supabase.storage
    .from("kyc-documents")
    .upload(path, file, { contentType: file.type, upsert: true });

  if (error) {
    console.error("[kyc-documents] Feltöltési hiba:", error.message);
    return { error: "A dokumentum feltöltése sikertelen." };
  }

  return { path };
}
