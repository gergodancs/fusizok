import type { Job } from "@/lib/types/job";
import { createClient } from "@/lib/supabase/server";

export async function getClientJobs(userId: string): Promise<Job[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("jobs")
    .select(
      "id, client_id, title, description, category, county, city, zip_code, status, required_completion_time, image_urls, created_at",
    )
    .eq("client_id", userId)
    .in("status", ["open", "assigned"])
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Lakos hirdetések lekérdezési hiba:", error.message);
    return [];
  }

  return (data ?? []) as Job[];
}
