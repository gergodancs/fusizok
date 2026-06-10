import { createClient } from "@/lib/supabase/server";
import { subCategoriesOverlap } from "@/lib/constants/categories";
import type { CraftsmanProfile } from "@/lib/types/profile";
import type { JobBidStats } from "@/lib/job-bid-stats";
import { getJobBidStatsByJobIds } from "@/lib/job-bid-stats";
import { filterMatchedJobIds } from "@/lib/location/gps-db";
import {
  type CoverageArea,
  jobMatchesCoverage,
  normalizeCoverageAreas,
} from "@/lib/places";
import type { Job } from "@/lib/types/job";

export type JobWithMarketStats = Job & JobBidStats;

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

export type MatchedJobsResult = {
  jobs: JobWithMarketStats[];
  craftsmanProfile: CraftsmanProfile | null;
  professions: string[];
  subCategories: string[];
  coverageAreas: CoverageArea[];
};

export async function getMatchedJobsForCraftsman(
  userId: string,
): Promise<MatchedJobsResult> {
  const supabase = await createClient();

  const { data: craftsmanProfile, error: profileError } = await supabase
    .from("craftsman_profiles")
    .select(
      "id, profession, sub_categories, coverage_counties, coverage_zip_codes, county, city, location_gps, service_radius_km, bio, free_credits",
    )
    .eq("id", userId)
    .maybeSingle();

  if (profileError) {
    console.error("Fusizó profil lekérdezési hiba:", profileError.message);
    return {
      jobs: [],
      craftsmanProfile: null,
      professions: [],
      subCategories: [],
      coverageAreas: [],
    };
  }

  const professions = normalizeProfessions(craftsmanProfile?.profession);
  const subCategories =
    (craftsmanProfile?.sub_categories as string[] | null) ?? [];
  const coverageAreas = normalizeCoverageAreas(
    craftsmanProfile?.coverage_counties,
    craftsmanProfile?.coverage_zip_codes,
  );

  const hasServiceBase =
    Boolean(craftsmanProfile?.county && craftsmanProfile?.city) ||
    Boolean(craftsmanProfile?.location_gps) ||
    coverageAreas.length > 0;

  if (
    !craftsmanProfile ||
    subCategories.length === 0 ||
    !hasServiceBase
  ) {
    return {
      jobs: [],
      craftsmanProfile: (craftsmanProfile as CraftsmanProfile) ?? null,
      professions,
      subCategories,
      coverageAreas,
    };
  }

  let jobsQuery = supabase
    .from("jobs")
    .select(
      "id, client_id, title, description, category, sub_categories, county, city, zip_code, status, required_completion_time, image_urls, created_at, location_gps",
    )
    .eq("status", "open")
    .order("created_at", { ascending: false });

  if (subCategories.length > 0) {
    jobsQuery = jobsQuery.overlaps("sub_categories", subCategories);
  } else {
    jobsQuery = jobsQuery.in("category", professions);
  }

  const { data, error: jobsError } = await jobsQuery;

  if (jobsError) {
    console.error("Illeszkedő munkák lekérdezési hiba:", jobsError.message);
    return {
      jobs: [],
      craftsmanProfile: craftsmanProfile as CraftsmanProfile,
      professions,
      subCategories,
      coverageAreas,
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
  const candidateJobs = ((data ?? []) as Job[]).filter((job) => {
    if (bidJobIds.has(job.id)) {
      return false;
    }
    const jobSubs = job.sub_categories ?? [];
    if (subCategories.length > 0 && jobSubs.length > 0) {
      return subCategoriesOverlap(subCategories, jobSubs);
    }
    return professions.includes(job.category);
  });

  const candidateIds = candidateJobs.map((job) => job.id);
  const rpcMatchedIds = await filterMatchedJobIds(
    supabase,
    userId,
    candidateIds,
  );

  const matchedJobs =
    rpcMatchedIds !== null
      ? candidateJobs.filter((job) => rpcMatchedIds.includes(job.id))
      : candidateJobs.filter((job) => jobMatchesCoverage(job, coverageAreas));

  const statsByJobId = await getJobBidStatsByJobIds(
    matchedJobs.map((job) => job.id),
  );

  const jobs: JobWithMarketStats[] = matchedJobs.map((job) => {
    const stats = statsByJobId.get(job.id) ?? {
      bidCount: 0,
      contactSharedCount: 0,
    };

    return {
      ...job,
      bidCount: stats.bidCount,
      contactSharedCount: stats.contactSharedCount,
    };
  });

  return {
    jobs,
    craftsmanProfile: craftsmanProfile as CraftsmanProfile,
    professions,
    subCategories,
    coverageAreas,
  };
}

/** Új, még nem látott nyitott munkák száma (menü badge) – könnyű DB RPC. */
export async function countUnseenOpenJobsForCraftsman(
  userId: string,
): Promise<number> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc(
    "count_unseen_open_jobs_for_craftsman",
    { p_craftsman_id: userId },
  );

  if (error) {
    console.error("[craftsman] Új munkák badge RPC hiba:", error.message);
    return 0;
  }

  return Number(data ?? 0);
}
