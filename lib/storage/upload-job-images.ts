import { createClient } from "@/lib/supabase/server";

const BUCKET = "job-images";
const MAX_FILES = 8;
const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function uploadJobImages(
  files: File[],
  userId: string,
): Promise<{ urls: string[]; error?: string }> {
  if (files.length === 0) {
    return { urls: [] };
  }

  if (files.length > MAX_FILES) {
    return { urls: [], error: `Legfeljebb ${MAX_FILES} képet tölthetsz fel.` };
  }

  const supabase = await createClient();
  const urls: string[] = [];

  for (const file of files) {
    if (!file.size) continue;

    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        urls: [],
        error: "Csak JPG, PNG, WEBP vagy GIF képek engedélyezettek.",
      };
    }

    if (file.size > MAX_SIZE_BYTES) {
      return { urls: [], error: "Egy kép legfeljebb 5 MB lehet." };
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${userId}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { contentType: file.type, upsert: false });

    if (uploadError) {
      console.error("Képfeltöltési hiba:", uploadError.message);
      return { urls: [], error: "A képek feltöltése sikertelen." };
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    urls.push(data.publicUrl);
  }

  return { urls };
}
