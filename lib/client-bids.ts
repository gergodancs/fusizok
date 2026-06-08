import { createClient } from "@/lib/supabase/server";
import type { JobBid } from "@/lib/types/job-bid";

export type ClientBidOffer = JobBid & {
  job_title: string;
  job_status: string;
  craftsman_name: string | null;
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
    .select("id, full_name")
    .in("id", craftsmanIds);

  const profileMap = new Map(
    (profiles ?? []).map((p) => [p.id, p.full_name]),
  );

  return bids.map((bid) => {
    const job = jobMap.get(bid.job_id);
    return {
      ...bid,
      price: bid.price !== null ? Number(bid.price) : null,
      contact_shared: Boolean(bid.contact_shared),
      job_title: job?.title ?? "Ismeretlen munka",
      job_status: job?.status ?? "open",
      craftsman_name: profileMap.get(bid.craftsman_id) ?? null,
    } as ClientBidOffer;
  });
}
