import { createClient } from "@/lib/supabase/server";

export type BidChatAccess = {
  contact_shared: boolean;
  status: string;
};

export async function getBidChatAccess(
  jobId: string,
  craftsmanId: string,
): Promise<BidChatAccess | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("job_bids")
    .select("contact_shared, status")
    .eq("job_id", jobId)
    .eq("craftsman_id", craftsmanId)
    .maybeSingle();

  if (!data) return null;

  return {
    contact_shared: Boolean(data.contact_shared),
    status: data.status,
  };
}

export async function isContactSharedForConversation(
  jobId: string,
  craftsmanId: string,
): Promise<boolean> {
  const bid = await getBidChatAccess(jobId, craftsmanId);
  return Boolean(bid?.contact_shared);
}

/** Fusizó olvashatja a chatet, ha megosztották a kontaktot. */
export async function canCraftsmanReadConversation(
  jobId: string,
  craftsmanId: string,
): Promise<boolean> {
  return isContactSharedForConversation(jobId, craftsmanId);
}

/** Fusizó küldhet, ha a megrendelő megosztotta a kapcsolatot (pay-to-apply után szabad chat). */
export async function canCraftsmanSendInConversation(
  jobId: string,
  craftsmanId: string,
): Promise<boolean> {
  const bid = await getBidChatAccess(jobId, craftsmanId);
  if (!bid?.contact_shared) return false;
  return bid.status !== "rejected";
}

export async function canUserAccessConversation(
  conversation: {
    id: string;
    job_id: string;
    client_id: string;
    craftsman_id: string;
  },
  userId: string,
): Promise<boolean> {
  if (conversation.client_id === userId) {
    return true;
  }

  if (conversation.craftsman_id === userId) {
    return canCraftsmanReadConversation(
      conversation.job_id,
      conversation.craftsman_id,
    );
  }

  return false;
}
