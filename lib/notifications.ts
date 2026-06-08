import { createClient } from "@/lib/supabase/server";

export type ClientNavCounts = {
  unreadMessages: number;
  newOffers: number;
};

export type CraftsmanNavCounts = {
  unreadMessages: number;
  newContactShares: number;
};

async function countUnreadMessages(
  userId: string,
  conversationIds: string[],
): Promise<number> {
  if (conversationIds.length === 0) return 0;

  const supabase = await createClient();

  const { data: reads } = await supabase
    .from("conversation_reads")
    .select("conversation_id, last_read_at")
    .eq("user_id", userId)
    .in("conversation_id", conversationIds);

  const readMap = new Map(
    (reads ?? []).map((r) => [r.conversation_id, r.last_read_at]),
  );

  let total = 0;

  for (const convId of conversationIds) {
    const lastRead = readMap.get(convId) ?? "1970-01-01T00:00:00Z";

    const { count, error } = await supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("conversation_id", convId)
      .neq("sender_id", userId)
      .gt("created_at", lastRead);

    if (!error && count) {
      total += count;
    }
  }

  return total;
}

export async function getClientNavCounts(
  userId: string,
): Promise<ClientNavCounts> {
  const supabase = await createClient();

  const { data: conversations } = await supabase
    .from("conversations")
    .select("id")
    .eq("client_id", userId);

  const convIds = (conversations ?? []).map((c) => c.id);

  const { data: jobs } = await supabase
    .from("jobs")
    .select("id")
    .eq("client_id", userId);

  const jobIds = (jobs ?? []).map((j) => j.id);

  let newOffers = 0;
  if (jobIds.length > 0) {
    const { count } = await supabase
      .from("job_bids")
      .select("id", { count: "exact", head: true })
      .in("job_id", jobIds)
      .is("viewed_by_client_at", null);

    newOffers = count ?? 0;
  }

  const unreadMessages = await countUnreadMessages(userId, convIds);

  return { unreadMessages, newOffers };
}

export async function getCraftsmanNavCounts(
  userId: string,
): Promise<CraftsmanNavCounts> {
  const supabase = await createClient();

  const { data: sharedBids } = await supabase
    .from("job_bids")
    .select("job_id")
    .eq("craftsman_id", userId)
    .eq("contact_shared", true);

  const sharedJobIds = (sharedBids ?? []).map((b) => b.job_id);

  let convIds: string[] = [];
  if (sharedJobIds.length > 0) {
    const { data: conversations } = await supabase
      .from("conversations")
      .select("id")
      .eq("craftsman_id", userId)
      .in("job_id", sharedJobIds);

    convIds = (conversations ?? []).map((c) => c.id);
  }

  const { count } = await supabase
    .from("job_bids")
    .select("id", { count: "exact", head: true })
    .eq("craftsman_id", userId)
    .eq("contact_shared", true)
    .is("contact_seen_by_craftsman_at", null);

  const unreadMessages = await countUnreadMessages(userId, convIds);

  return {
    unreadMessages,
    newContactShares: count ?? 0,
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
    .in("job_id", jobs.map((j) => j.id))
    .is("viewed_by_client_at", null);
}

export async function markCraftsmanContactSharesSeen(
  craftsmanId: string,
): Promise<void> {
  const supabase = await createClient();

  await supabase
    .from("job_bids")
    .update({ contact_seen_by_craftsman_at: new Date().toISOString() })
    .eq("craftsman_id", craftsmanId)
    .eq("contact_shared", true)
    .is("contact_seen_by_craftsman_at", null);
}

export async function markConversationRead(
  conversationId: string,
  userId: string,
): Promise<void> {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data: existing } = await supabase
    .from("conversation_reads")
    .select("conversation_id")
    .eq("conversation_id", conversationId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("conversation_reads")
      .update({ last_read_at: now })
      .eq("conversation_id", conversationId)
      .eq("user_id", userId);
  } else {
    await supabase.from("conversation_reads").insert({
      conversation_id: conversationId,
      user_id: userId,
      last_read_at: now,
    });
  }
}
