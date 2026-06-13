import {
  canCraftsmanSendInConversation,
  canUserAccessConversation,
} from "@/lib/chat-access";
import { createClient } from "@/lib/supabase/server";
import type { ConversationWithDetails } from "@/lib/types/conversation";
import type { Message } from "@/lib/types/message";

type UserRole = "client" | "craftsman";

export async function getUserConversations(
  userId: string,
  role: UserRole,
): Promise<ConversationWithDetails[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("conversations")
    .select("id, job_id, client_id, craftsman_id, created_at")
    .or(`client_id.eq.${userId},craftsman_id.eq.${userId}`)
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("Beszélgetések lekérdezési hiba:", error?.message);
    return [];
  }

  let rows = data;

  if (role === "craftsman") {
    const { data: sharedBids } = await supabase
      .from("job_bids")
      .select("job_id")
      .eq("craftsman_id", userId)
      .eq("contact_shared", true);

    const sharedJobIds = new Set((sharedBids ?? []).map((b) => b.job_id));

    rows = rows.filter(
      (row) =>
        row.client_id === userId ||
        (row.craftsman_id === userId && sharedJobIds.has(row.job_id)),
    );
  }

  const conversations: ConversationWithDetails[] = [];

  for (const row of rows) {
    const { data: job } = await supabase
      .from("jobs")
      .select("title, status")
      .eq("id", row.job_id)
      .maybeSingle();

    const otherId =
      row.client_id === userId ? row.craftsman_id : row.client_id;
    const { data: otherProfile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", otherId)
      .maybeSingle();

    const { data: lastMsg } = await supabase
      .from("messages")
      .select("content, created_at")
      .eq("conversation_id", row.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    conversations.push({
      id: row.id,
      job_id: row.job_id,
      client_id: row.client_id,
      craftsman_id: row.craftsman_id,
      created_at: row.created_at,
      job_title: job?.title ?? "Ismeretlen munka",
      job_status: job?.status ?? "open",
      other_party_name: otherProfile?.full_name ?? null,
      last_message: lastMsg?.content ?? null,
      last_message_at: lastMsg?.created_at ?? null,
    });
  }

  return conversations;
}

export async function findConversationByJob(
  userId: string,
  jobId: string,
  role: UserRole,
): Promise<string | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("conversations")
    .select("id, job_id, client_id, craftsman_id")
    .eq("job_id", jobId)
    .or(`client_id.eq.${userId},craftsman_id.eq.${userId}`)
    .maybeSingle();

  if (!data) return null;

  const hasAccess = await canUserAccessConversation(data, userId);
  if (!hasAccess) return null;

  if (role === "craftsman" && data.craftsman_id !== userId) {
    return null;
  }

  return data.id;
}

export async function getConversationMessages(
  conversationId: string,
  userId: string,
): Promise<{
  messages: Message[];
  canAccess: boolean;
  canSend: boolean;
  bidId: string | null;
  craftsmanPaymentRequired: boolean;
}> {
  const supabase = await createClient();

  const { data: conversation } = await supabase
    .from("conversations")
    .select("id, job_id, client_id, craftsman_id, status")
    .eq("id", conversationId)
    .maybeSingle();

  if (!conversation) {
    return {
      messages: [],
      canAccess: false,
      canSend: false,
      bidId: null,
      craftsmanPaymentRequired: false,
    };
  }

  const hasAccess = await canUserAccessConversation(conversation, userId);
  if (!hasAccess) {
    return {
      messages: [],
      canAccess: false,
      canSend: false,
      bidId: null,
      craftsmanPaymentRequired: false,
    };
  }

  const isCraftsman = conversation.craftsman_id === userId;
  const isClosed = conversation.status === "closed";
  let canSend = !isClosed;
  const craftsmanPaymentRequired = false;
  let bidId: string | null = null;

  if (isCraftsman) {
    canSend = await canCraftsmanSendInConversation(
      conversation.job_id,
      conversation.craftsman_id,
    );

    const { data: bid } = await supabase
      .from("job_bids")
      .select("id, status")
      .eq("job_id", conversation.job_id)
      .eq("craftsman_id", conversation.craftsman_id)
      .maybeSingle();

    bidId = bid?.id ?? null;
  }

  const { data, error } = await supabase
    .from("messages")
    .select("id, conversation_id, sender_id, content, created_at, is_system, visible_to_role")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Üzenetek lekérdezési hiba:", error.message);
    return {
      messages: [],
      canAccess: true,
      canSend,
      bidId,
      craftsmanPaymentRequired,
    };
  }

  return {
    messages: (data ?? []) as Message[],
    canAccess: true,
    canSend,
    bidId,
    craftsmanPaymentRequired,
  };
}

export async function getConversationHeader(
  conversationId: string,
  userId: string,
) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("conversations")
    .select("id, job_id, client_id, craftsman_id, status")
    .eq("id", conversationId)
    .maybeSingle();

  if (!data) {
    return null;
  }

  const hasAccess = await canUserAccessConversation(data, userId);
  if (!hasAccess) {
    return null;
  }

  const { data: job } = await supabase
    .from("jobs")
    .select("title, status")
    .eq("id", data.job_id)
    .maybeSingle();

  const otherId =
    data.client_id === userId ? data.craftsman_id : data.client_id;
  const { data: otherProfile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", otherId)
    .maybeSingle();

  return {
    jobTitle: job?.title ?? "Ismeretlen munka",
    jobStatus: job?.status ?? "open",
    otherPartyName: otherProfile?.full_name ?? "Ismeretlen",
    otherPartyId: otherId,
    conversationStatus: data.status ?? "open",
  };
}
