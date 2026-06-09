import { createClient } from "@/lib/supabase/server";
import type { JobBid } from "@/lib/types/job-bid";

export type ClientBidOffer = JobBid & {
  job_title: string;
  job_status: string;
  craftsman_name: string | null;
  craftsman_avatar_url: string | null;
  craftsman_avg_rating: number | null;
  craftsman_review_count: number;
};

export async function getClientJobOffers(
  clientId: string,
): Promise<ClientBidOffer[]> {
  const supabase = await createClient();

  const { data: jobs } = await supabase
    .from("jobs")
    .select("id, title, status")
    .eq("client_id", clientId);

  if (!jobs?.length) return [];

  const jobIds = jobs.map((j) => j.id);
  const jobMap = new Map(jobs.map((j) => [j.id, j]));

  const { data: bids, error } = await supabase
    .from("job_bids")
    .select(
      "id, job_id, craftsman_id, price, message, availability_duration, contact_shared, status, created_at",
    )
    .in("job_id", jobIds)
    .order("created_at", { ascending: false });

  if (error || !bids) {
    console.error("Ajánlatok lekérdezési hiba:", error?.message);
    return [];
  }

  const craftsmanIds = [...new Set(bids.map((b) => b.craftsman_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .in("id", craftsmanIds);

  const profileMap = new Map(
    (profiles ?? []).map((p) => [
      p.id,
      { name: p.full_name, avatar_url: p.avatar_url },
    ]),
  );

  const { data: reviews } = await supabase
    .from("reviews")
    .select("reviewee_id, rating")
    .in("reviewee_id", craftsmanIds);

  const ratingMap = new Map<string, { total: number; count: number }>();
  for (const review of reviews ?? []) {
    const current = ratingMap.get(review.reviewee_id) ?? { total: 0, count: 0 };
    ratingMap.set(review.reviewee_id, {
      total: current.total + review.rating,
      count: current.count + 1,
    });
  }

  return bids.map((bid) => {
    const job = jobMap.get(bid.job_id);
    const craftsman = profileMap.get(bid.craftsman_id);
    const ratings = ratingMap.get(bid.craftsman_id);
    const avgRating =
      ratings && ratings.count > 0
        ? Math.round((ratings.total / ratings.count) * 10) / 10
        : null;

    return {
      ...bid,
      price: bid.price !== null ? Number(bid.price) : null,
      contact_shared: Boolean(bid.contact_shared),
      job_title: job?.title ?? "Ismeretlen munka",
      job_status: job?.status ?? "open",
      craftsman_name: craftsman?.name ?? null,
      craftsman_avatar_url: craftsman?.avatar_url ?? null,
      craftsman_avg_rating: avgRating,
      craftsman_review_count: ratings?.count ?? 0,
    } as ClientBidOffer;
  });
}
