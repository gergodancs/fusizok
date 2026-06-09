import { createClient } from "@/lib/supabase/server";

type UploadImageOptions = {
  bucket: string;
  path: string;
  file: File;
  allowedTypes: readonly string[];
  upsert?: boolean;
};

export async function uploadImageToStorage(
  options: UploadImageOptions,
): Promise<{ url?: string; error?: string }> {
  const { bucket, path, file, allowedTypes, upsert = false } = options;

  if (!file.size) {
    return { error: "Üres fájl." };
  }

  if (!allowedTypes.includes(file.type)) {
    return { error: "Nem támogatott képformátum." };
  }

  const supabase = await createClient();

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, file, { contentType: file.type, upsert });

  if (uploadError) {
    console.error(`[storage:${bucket}] Feltöltési hiba:`, uploadError.message);
    return { error: "A kép feltöltése sikertelen." };
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { url: data.publicUrl };
}
