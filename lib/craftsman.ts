import { isBudapestDistrict } from "@/lib/budapest-districts";
import { createClient } from "@/lib/supabase/server";
import type { CraftsmanProfile } from "@/lib/types/profile";
import type { Job } from "@/lib/types/job";

export function normalizeProfessions(
  profession: string | string[] | null | undefined,
): string[] {
  if (!profession) return [];

  if (Array.isArray(profession)) {
    return profession.map((p) => p.trim()).filter(Boolean);
  }

  if (profession.includes(",")) {
    return profession
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
  }

  return [profession.trim()].filter(Boolean);
}

export function normalizeDistricts(
  districts: string[] | null | undefined,
): string[] {
  if (!districts) return [];
  return districts.map((d) => d.trim()).filter((d) => isBudapestDistrict(d));
}

export type MatchedJobsResult = {
  jobs: Job[];
  craftsmanProfile: CraftsmanProfile | null;
  professions: string[];
  districts: string[];
};

export async function getMatchedJobsForCraftsman(
  userId: string,
): Promise<MatchedJobsResult> {
  const supabase = await createClient();

  const { data: craftsmanProfile, error: profileError } = await supabase
    .from("craftsman_profiles")
    .select("id, profession, coverage_zip_codes")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) {
    console.error("Fusizó profil lekérdezési hiba:", profileError.message);
    return {
      jobs: [],
      craftsmanProfile: null,
      professions: [],
      districts: [],
    };
  }

  const professions = normalizeProfessions(craftsmanProfile?.profession);
  const districts = normalizeDistricts(craftsmanProfile?.coverage_zip_codes);

  if (!craftsmanProfile || professions.length === 0 || districts.length === 0) {
    return {
      jobs: [],
      craftsmanProfile: (craftsmanProfile as CraftsmanProfile) ?? null,
      professions,
      districts,
    };
  }

  const { data, error: jobsError } = await supabase
    .from("jobs")
    .select(
      "id, client_id, title, description, category, zip_code, status, required_completion_time, image_urls, created_at",
    )
    .eq("status", "open")
    .in("category", professions)
    .in("zip_code", districts)
    .order("created_at", { ascending: false });

  if (jobsError) {
    console.error("Illeszkedő munkák lekérdezési hiba:", jobsError.message);
    return {
      jobs: [],
      craftsmanProfile: craftsmanProfile as CraftsmanProfile,
      professions,
      districts,
    };
  }

  const { data: existingBids, error: bidsError } = await supabase
    .from("job_bids")
    .select("job_id")
    .eq("craftsman_id", userId);

  if (bidsError) {
    console.error("Pályázatok lekérdezési hiba:", bidsError.message);
  }

  const bidJobIds = new Set((existingBids ?? []).map((b) => b.job_id));

  const jobs = ((data ?? []) as Job[]).filter((job) => !bidJobIds.has(job.id));

  return {
    jobs,
    craftsmanProfile: craftsmanProfile as CraftsmanProfile,
    professions,
    districts,
  };
}
