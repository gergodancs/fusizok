"use server";

import { revalidatePath } from "next/cache";
import { canUserAccessConversation } from "@/lib/chat-access";
import { getSessionUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export type SendMessageState = {
  error?: string;
};

export async function sendMessage(
  _prevState: SendMessageState,
  formData: FormData,
): Promise<SendMessageState> {
  const user = await getSessionUser();
  if (!user) {
    return { error: "Bejelentkezés szükséges." };
  }

  const conversationId = formData.get("conversation_id") as string;
  const content = (formData.get("content") as string)?.trim();

  if (!conversationId || !content) {
    return { error: "Az üzenet nem lehet üres." };
  }

  const supabase = await createClient();

  const { data: conversation } = await supabase
    .from("conversations")
    .select("id, job_id, client_id, craftsman_id")
    .eq("id", conversationId)
    .maybeSingle();

  if (!conversation) {
    return { error: "Nincs hozzáférésed ehhez a beszélgetéshez." };
  }

  const hasAccess = await canUserAccessConversation(conversation, user.id);
  if (!hasAccess) {
    return {
      error:
        "A chat csak akkor érhető el, ha a megrendelő megosztotta a kapcsolatot.",
    };
  }

  const { error } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: user.id,
    content,
  });

  if (error) {
    console.error("Üzenet küldési hiba:", error.message);
    return { error: "Az üzenet küldése sikertelen." };
  }

  revalidatePath("/lakos", "layout");
  revalidatePath("/szaki", "layout");
  revalidatePath(`/szaki/uzenetek/${conversationId}`);
  revalidatePath(`/lakos/uzenetek/${conversationId}`);
  revalidatePath("/szaki/uzenetek");
  revalidatePath("/lakos/uzenetek");
  return {};
}
