import { createClient } from "@/lib/supabase/server";

export type JobBidStats = {
  bidCount: number;
  contactSharedCount: number;
};

export async function getJobBidStatsByJobIds(
  jobIds: string[],
): Promise<Map<string, JobBidStats>> {
  const stats = new Map<string, JobBidStats>();

  if (jobIds.length === 0) {
    return stats;
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("job_bids")
    .select("job_id, contact_shared")
    .in("job_id", jobIds);

  if (error) {
    console.error("Pályázat statisztika hiba:", error.message);
    return stats;
  }

  for (const row of data ?? []) {
    const current = stats.get(row.job_id) ?? {
      bidCount: 0,
      contactSharedCount: 0,
    };
    current.bidCount += 1;
    if (row.contact_shared) {
      current.contactSharedCount += 1;
    }
    stats.set(row.job_id, current);
  }

  return stats;
}

export async function getJobBidStats(
  jobId: string,
): Promise<JobBidStats> {
  const map = await getJobBidStatsByJobIds([jobId]);
  return map.get(jobId) ?? { bidCount: 0, contactSharedCount: 0 };
}
