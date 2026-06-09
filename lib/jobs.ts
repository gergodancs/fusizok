import { createClient } from "@/lib/supabase/server";
import type { Job } from "@/lib/types/job";

export async function getJobs(): Promise<Job[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("jobs")
    .select("id, client_id, title, description, category, county, zip_code, status, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Jobs lekérdezési hiba:", error.message);
    return [];
  }

  return (data ?? []) as Job[];
}
