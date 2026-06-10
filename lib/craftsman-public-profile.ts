import { normalizeProfessions } from "@/lib/craftsman";
import { getCraftsmanPortfolioImages } from "@/lib/portfolio";
import { getCraftsmanReviewSummary } from "@/lib/reviews";
import { normalizeCoverageAreas, type CoverageArea } from "@/lib/places";
import { createClient } from "@/lib/supabase/server";
import type { CraftsmanReviewSummary } from "@/lib/types/review";
import type { PortfolioImage } from "@/lib/types/portfolio";

export type CraftsmanPublicProfile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  is_verified: boolean;
  bio: string | null;
  professions: string[];
  coverageAreas: CoverageArea[];
  serviceRadiusKm: number;
  county: string | null;
  city: string | null;
  portfolioImages: PortfolioImage[];
  reviewSummary: CraftsmanReviewSummary;
};

export type ClientBidPreview = {
  id: string;
  job_id: string;
  job_title: string;
  price: number | null;
  message: string | null;
  availability_duration: string | null;
  status: string;
  created_at: string;
};

export async function clientHasBidFromCraftsman(
  clientId: string,
  craftsmanId: string,
): Promise<boolean> {
  const supabase = await createClient();

  const { data: jobs, error: jobsError } = await supabase
    .from("jobs")
    .select("id")
    .eq("client_id", clientId);

  if (jobsError || !jobs?.length) {
    return false;
  }

  const { data: bid, error } = await supabase
    .from("job_bids")
    .select("id")
    .eq("craftsman_id", craftsmanId)
    .in(
      "job_id",
      jobs.map((j) => j.id),
    )
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Pályázat-ellenőrzési hiba:", error.message);
    return false;
  }

  return Boolean(bid);
}

export async function getClientBidPreview(
  clientId: string,
  bidId: string,
  craftsmanId: string,
): Promise<ClientBidPreview | null> {
  const supabase = await createClient();

  const { data: bid, error } = await supabase
    .from("job_bids")
    .select(
      "id, job_id, craftsman_id, price, message, availability_duration, status, created_at",
    )
    .eq("id", bidId)
    .eq("craftsman_id", craftsmanId)
    .maybeSingle();

  if (error || !bid) {
    return null;
  }

  const { data: job } = await supabase
    .from("jobs")
    .select("title, client_id")
    .eq("id", bid.job_id)
    .maybeSingle();

  if (!job || job.client_id !== clientId) {
    return null;
  }

  return {
    id: bid.id,
    job_id: bid.job_id,
    job_title: job.title,
    price: bid.price !== null ? Number(bid.price) : null,
    message: bid.message,
    availability_duration: bid.availability_duration,
    status: bid.status,
    created_at: bid.created_at,
  };
}

export async function getCraftsmanPublicProfile(
  craftsmanId: string,
): Promise<CraftsmanPublicProfile | null> {
  const supabase = await createClient();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, role, is_verified")
    .eq("id", craftsmanId)
    .maybeSingle();

  if (profileError || !profile || profile.role !== "craftsman") {
    return null;
  }

  const { data: craftsman, error: craftsmanError } = await supabase
    .from("craftsman_profiles")
    .select(
      "profession, coverage_counties, coverage_zip_codes, county, city, location_gps, service_radius_km, bio",
    )
    .eq("id", craftsmanId)
    .maybeSingle();

  if (craftsmanError) {
    console.error("Fusizó profil lekérdezési hiba:", craftsmanError.message);
    return null;
  }

  const [portfolioImages, reviewSummary] = await Promise.all([
    getCraftsmanPortfolioImages(craftsmanId),
    getCraftsmanReviewSummary(craftsmanId),
  ]);

  return {
    id: profile.id,
    full_name: profile.full_name,
    avatar_url: profile.avatar_url,
    is_verified: Boolean(profile.is_verified),
    bio: craftsman?.bio ?? null,
    professions: normalizeProfessions(craftsman?.profession),
    coverageAreas: normalizeCoverageAreas(
      craftsman?.coverage_counties,
      craftsman?.coverage_zip_codes,
    ),
    serviceRadiusKm: craftsman?.service_radius_km ?? 25,
    county: craftsman?.county ?? null,
    city: craftsman?.city ?? null,
    portfolioImages,
    reviewSummary,
  };
}
