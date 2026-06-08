import { createClient } from "@/lib/supabase/server";

export async function isContactSharedForConversation(
  jobId: string,
  craftsmanId: string,
): Promise<boolean> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("job_bids")
    .select("contact_shared")
    .eq("job_id", jobId)
    .eq("craftsman_id", craftsmanId)
    .eq("contact_shared", true)
    .maybeSingle();

  return Boolean(data);
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
    return isContactSharedForConversation(
      conversation.job_id,
      conversation.craftsman_id,
    );
  }

  return false;
}
