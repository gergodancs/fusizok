import type { SupabaseClient } from "@supabase/supabase-js";

export const LOSING_CHAT_SYSTEM_MESSAGE =
  "Sajnáljuk, a megrendelő ezúttal egy másik szakembert választott a feladatra. Ne csüggedj, böngéssz tovább a többi elérhető fusimunka között! 🚀";

export async function closeLosingChatsForJob(
  supabase: SupabaseClient,
  params: {
    jobId: string;
    winningCraftsmanId: string;
    clientId: string;
  },
): Promise<void> {
  const { jobId, winningCraftsmanId, clientId } = params;

  const { data: conversations, error: convError } = await supabase
    .from("conversations")
    .select("id, craftsman_id, status")
    .eq("job_id", jobId)
    .neq("craftsman_id", winningCraftsmanId);

  if (convError) {
    console.error("[closeLosingChats] Beszélgetés lekérdezés:", convError.message);
    return;
  }

  for (const conversation of conversations ?? []) {
    if (conversation.status === "closed") {
      continue;
    }

    const { error: closeError } = await supabase
      .from("conversations")
      .update({ status: "closed" })
      .eq("id", conversation.id);

    if (closeError) {
      console.error("[closeLosingChats] Lezárás hiba:", closeError.message);
      continue;
    }

    const { error: messageError } = await supabase.from("messages").insert({
      conversation_id: conversation.id,
      sender_id: clientId,
      content: LOSING_CHAT_SYSTEM_MESSAGE,
      is_system: true,
    });

    if (messageError) {
      console.error("[closeLosingChats] Rendszerüzenet hiba:", messageError.message);
    }
  }

  const { error: bidError } = await supabase
    .from("job_bids")
    .update({ status: "rejected" })
    .eq("job_id", jobId)
    .neq("craftsman_id", winningCraftsmanId)
    .in("status", ["pending", "pending_payment", "active"]);

  if (bidError) {
    console.error("[closeLosingChats] Pályázat elutasítás:", bidError.message);
  }
}
