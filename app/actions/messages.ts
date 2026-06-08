"use server";

import { revalidatePath } from "next/cache";
import { notifyUser } from "@/app/utils/notifications";
import { canUserAccessConversation } from "@/lib/chat-access";
import { getSessionUser, getUserProfile } from "@/lib/auth/session";
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

  const recipientId =
    conversation.client_id === user.id
      ? conversation.craftsman_id
      : conversation.client_id;

  const senderProfile = await getUserProfile(user.id);
  const senderName = senderProfile?.full_name ?? "Valaki";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const chatPath =
    recipientId === conversation.client_id
      ? `/lakos/uzenetek/${conversationId}`
      : `/szaki/uzenetek/${conversationId}`;

  await notifyUser({
    userId: recipientId,
    title: "Új üzenet",
    body: `Új üzeneted érkezett tőle: ${senderName}`,
    url: `${appUrl}${chatPath}`,
    emailSubject: `Új üzenet – ${senderName}`,
    emailHtml: `<p>Szia!</p><p><strong>${senderName}</strong> üzenetet küldött neked a fusizok.hu-n.</p><p><a href="${appUrl}${chatPath}">Üzenet megnyitása</a></p>`,
    tag: `chat-${conversationId}`,
  });

  revalidatePath("/lakos", "layout");
  revalidatePath("/szaki", "layout");
  revalidatePath(`/szaki/uzenetek/${conversationId}`);
  revalidatePath(`/lakos/uzenetek/${conversationId}`);
  revalidatePath("/szaki/uzenetek");
  revalidatePath("/lakos/uzenetek");
  return {};
}
