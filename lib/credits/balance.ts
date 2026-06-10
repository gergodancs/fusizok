import { createClient } from "@/lib/supabase/server";

export async function getCraftsmanCreditBalance(
  userId: string,
): Promise<number> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("credits")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) {
    console.error("[credits] Egyenleg lekérdezési hiba:", error?.message);
    return 0;
  }

  return Number(data.credits ?? 0);
}
