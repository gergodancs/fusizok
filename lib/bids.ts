import { createClient } from "@/lib/supabase/server";
import type { JobBid, JobBidStatus } from "@/lib/types/job-bid";
import type { JobStatus } from "@/lib/types/job";

export type BidWithJob = JobBid & {
  job: {
    id: string;
    title: string;
    status: JobStatus;
    category: string;
    county?: string | null;
    zip_code: string;
    client_id: string;
  };
};

export type CraftsmanActivity = {
  pending: BidWithJob[];
  accepted: BidWithJob[];
  closed: BidWithJob[];
};

function categorizeBids(bids: BidWithJob[]): CraftsmanActivity {
  const pending: BidWithJob[] = [];
  const accepted: BidWithJob[] = [];
  const closed: BidWithJob[] = [];

  for (const bid of bids) {
    if (bid.status === "rejected") {
      closed.push(bid);
    } else if (
      bid.status === "accepted" ||
      bid.status === "active" ||
      bid.contact_shared
    ) {
      accepted.push(bid);
    } else if (bid.status === "pending") {
      if (bid.job.status === "open" || bid.job.status === "assigned") {
        pending.push(bid);
      } else {
        closed.push(bid);
      }
    }
  }

  return { pending, accepted, closed };
}

export async function getCraftsmanActivity(
  craftsmanId: string,
): Promise<CraftsmanActivity> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("job_bids")
    .select(
      `
      id,
      job_id,
      craftsman_id,
      price,
      message,
      availability_duration,
      contact_shared,
      status,
      created_at,
      job:jobs (
        id,
        title,
        status,
        category,
        county,
        zip_code,
        client_id
      )
    `,
    )
    .eq("craftsman_id", craftsmanId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Pályázatok lekérdezési hiba:", error.message);
    return { pending: [], accepted: [], closed: [] };
  }

  const bids: BidWithJob[] = (data ?? [])
    .map((row) => {
      const jobData = Array.isArray(row.job) ? row.job[0] : row.job;
      if (!jobData) return null;
      return {
        id: row.id,
        job_id: row.job_id,
        craftsman_id: row.craftsman_id,
        price: row.price !== null ? Number(row.price) : null,
        message: row.message,
        availability_duration: row.availability_duration ?? null,
        contact_shared: Boolean(row.contact_shared),
        status: row.status as JobBidStatus,
        created_at: row.created_at,
        job: jobData as BidWithJob["job"],
      };
    })
    .filter((bid): bid is BidWithJob => bid !== null);

  return categorizeBids(bids);
}
