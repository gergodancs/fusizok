import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { Job } from "@/lib/types/job";

export type PublicJobListing = {
  id: string;
  title: string;
  description: string;
  category: string;
  sub_categories: string[];
  county: string | null;
  city: string | null;
  required_completion_time: string | null;
  created_at: string;
  client_display_name: string;
  bid_count: number;
  has_images: boolean;
};

const CRAFTSMAN_JOB_SELECT =
  "id, title, description, category, sub_categories, county, city, zip_code, location_gps, status, required_completion_time, image_urls, created_at, client_id";

export async function getPublicJobListing(
  jobId: string,
): Promise<PublicJobListing | null> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_public_job_listing", {
    p_job_id: jobId,
  });

  if (error) {
    console.error("[job-listing] Publikus RPC hiba:", error.message);

    const admin = createAdminClient();
    if (!admin) {
      return null;
    }

    const { data: job } = await admin
      .from("jobs")
      .select(
        "id, title, description, category, sub_categories, county, city, required_completion_time, created_at, image_urls, client_id, status",
      )
      .eq("id", jobId)
      .eq("status", "open")
      .maybeSingle();

    if (!job) {
      return null;
    }

    const { data: profile } = await admin
      .from("profiles")
      .select("full_name")
      .eq("id", job.client_id)
      .maybeSingle();

    const { count } = await admin
      .from("job_bids")
      .select("id", { count: "exact", head: true })
      .eq("job_id", jobId);

    const imageUrls = (job.image_urls as string[] | null) ?? [];
    const nameParts =
      profile?.full_name?.trim().split(/\s+/).filter(Boolean) ?? [];
    const firstName =
      nameParts.length >= 2
        ? nameParts[nameParts.length - 1]!
        : nameParts[0] ?? "Egy lakos";

    return {
      id: job.id,
      title: job.title,
      description: job.description,
      category: job.category,
      sub_categories: (job.sub_categories as string[] | null) ?? [],
      county: job.county,
      city: job.city,
      required_completion_time: job.required_completion_time,
      created_at: job.created_at,
      client_display_name: firstName,
      bid_count: count ?? 0,
      has_images: imageUrls.length > 0,
    };
  }

  if (!data) {
    return null;
  }

  const listing = data as PublicJobListing;
  return {
    ...listing,
    sub_categories: listing.sub_categories ?? [],
    bid_count: Number(listing.bid_count ?? 0),
    has_images: Boolean(listing.has_images),
  };
}

export async function getCraftsmanJobListing(
  jobId: string,
): Promise<Job | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("jobs")
    .select(CRAFTSMAN_JOB_SELECT)
    .eq("id", jobId)
    .eq("status", "open")
    .maybeSingle();

  if (error) {
    console.error("[job-listing] Fusizó munka lekérdezési hiba:", error.message);
    return null;
  }

  return data as Job | null;
}

export async function listOpenJobIdsForSitemap(
  limit = 500,
): Promise<{ id: string; created_at: string }[]> {
  const admin = createAdminClient();
  if (!admin) {
    return [];
  }

  const { data, error } = await admin
    .from("jobs")
    .select("id, created_at")
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[job-listing] Sitemap jobs hiba:", error.message);
    return [];
  }

  return data ?? [];
}
