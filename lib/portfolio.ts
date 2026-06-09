import { createClient } from "@/lib/supabase/server";
import type { PortfolioImage } from "@/lib/types/portfolio";

export async function getCraftsmanPortfolioImages(
  craftsmanId: string,
): Promise<PortfolioImage[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("portfolio_images")
    .select("id, craftsman_id, image_url, created_at")
    .eq("craftsman_id", craftsmanId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Portfólió lekérdezési hiba:", error.message);
    return [];
  }

  return (data ?? []) as PortfolioImage[];
}

export async function countCraftsmanPortfolioImages(
  craftsmanId: string,
): Promise<number> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("portfolio_images")
    .select("id", { count: "exact", head: true })
    .eq("craftsman_id", craftsmanId);

  if (error) {
    console.error("Portfólió számlálási hiba:", error.message);
    return 0;
  }

  return count ?? 0;
}
