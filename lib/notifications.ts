import { createClient } from "@/lib/supabase/server";

export type ClientNavCounts = {
  unreadMessages: number;
  newOffers: number;
};

export type CraftsmanNavCounts = {
  newOpenJobs: number;
  newActivity: number;
  chatNotifications: number;
};

export async function getClientNavCounts(
  userId: string,
): Promise<ClientNavCounts> {
  const supabase = await createClient();

  const { data: jobs } = await supabase
    .from("jobs")
    .select("id")
    .eq("client_id", userId);

  const jobIds = (jobs ?? []).map((job) => job.id);

  const [{ data: unreadData, error: unreadError }, offersResult] =
    await Promise.all([
      supabase.rpc("count_unread_messages_for_user", {
        p_user_id: userId,
      }),
      jobIds.length > 0
        ? supabase
            .from("job_bids")
            .select("id", { count: "exact", head: true })
            .in("job_id", jobIds)
            .is("viewed_by_client_at", null)
        : Promise.resolve({ count: 0, error: null }),
    ]);

  if (unreadError) {
    console.error("[notify] Olvasatlan üzenet RPC hiba:", unreadError.message);
  }
  if (offersResult.error) {
    console.error("[notify] Új ajánlat számláló hiba:", offersResult.error.message);
  }

  return {
    unreadMessages: Number(unreadData ?? 0),
    newOffers: offersResult.count ?? 0,
  };
}

export async function getCraftsmanNavCounts(
  userId: string,
): Promise<CraftsmanNavCounts> {
  const supabase = await createClient();

  const [
    { data: newOpenJobs, error: openJobsError },
    { count: newActivity, error: activityError },
    { count: paymentRequired, error: paymentError },
    { data: unreadMessages, error: unreadError },
  ] = await Promise.all([
    supabase.rpc("count_unseen_open_jobs_for_craftsman", {
      p_craftsman_id: userId,
    }),
    supabase
      .from("job_bids")
      .select("id", { count: "exact", head: true })
      .eq("craftsman_id", userId)
      .is("activity_seen_by_craftsman_at", null)
      .or("contact_shared.eq.true,status.eq.rejected"),
    supabase
      .from("job_bids")
      .select("id", { count: "exact", head: true })
      .eq("craftsman_id", userId)
      .eq("contact_shared", true)
      .eq("status", "pending_payment"),
    supabase.rpc("count_unread_messages_for_user", {
      p_user_id: userId,
    }),
  ]);

  if (openJobsError) {
    console.error("[notify] Új munkák badge RPC hiba:", openJobsError.message);
  }
  if (activityError) {
    console.error("[notify] Aktivitás badge hiba:", activityError.message);
  }
  if (paymentError) {
    console.error("[notify] Fizetés badge hiba:", paymentError.message);
  }
  if (unreadError) {
    console.error("[notify] Olvasatlan üzenet RPC hiba:", unreadError.message);
  }

  const unread = Number(unreadMessages ?? 0);
  const payment = paymentRequired ?? 0;

  return {
    newOpenJobs: Number(newOpenJobs ?? 0),
    newActivity: newActivity ?? 0,
    chatNotifications: unread + payment,
  };
}

export async function markClientOffersViewed(clientId: string): Promise<void> {
  const supabase = await createClient();

  const { data: jobs } = await supabase
    .from("jobs")
    .select("id")
    .eq("client_id", clientId);

  if (!jobs?.length) return;

  await supabase
    .from("job_bids")
    .update({ viewed_by_client_at: new Date().toISOString() })
    .in(
      "job_id",
      jobs.map((j) => j.id),
    )
    .is("viewed_by_client_at", null);
}

export async function markCraftsmanContactSharesSeen(
  craftsmanId: string,
): Promise<void> {
  await markCraftsmanActivitySeen(craftsmanId);
}

export async function markCraftsmanActivitySeen(
  craftsmanId: string,
): Promise<void> {
  const supabase = await createClient();
  const now = new Date().toISOString();

  await supabase
    .from("job_bids")
    .update({
      activity_seen_by_craftsman_at: now,
      contact_seen_by_craftsman_at: now,
    })
    .eq("craftsman_id", craftsmanId);
}

export async function markOpenJobsSeen(craftsmanId: string): Promise<void> {
  const supabase = await createClient();

  await supabase
    .from("craftsman_profiles")
    .update({ open_jobs_seen_at: new Date().toISOString() })
    .eq("id", craftsmanId);
}

export async function markConversationRead(
  conversationId: string,
  userId: string,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();

  const { data: latestMessage } = await supabase
    .from("messages")
    .select("created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const lastReadAt =
    latestMessage?.created_at ?? new Date().toISOString();

  const { error } = await supabase.from("conversation_reads").upsert(
    {
      conversation_id: conversationId,
      user_id: userId,
      last_read_at: lastReadAt,
    },
    { onConflict: "conversation_id,user_id" },
  );

  if (error) {
    console.error("Olvasottnak jelölési hiba:", error.message);
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
