"use server";

import { revalidatePath } from "next/cache";
import { notifyUser } from "@/app/utils/notifications";
import { buildNewMessageEmailHtml } from "@/lib/notification-templates";
import { getAppBaseUrl } from "@/lib/stripe/config";
import {
  canCraftsmanSendInConversation,
  canUserAccessConversation,
} from "@/lib/chat-access";
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

  if (conversation.craftsman_id === user.id) {
    const canSend = await canCraftsmanSendInConversation(
      conversation.job_id,
      conversation.craftsman_id,
    );
    if (!canSend) {
      return {
        error:
          "A válaszadáshoz előbb fizesd ki a chat kapcsolatfelvételi díjat.",
      };
    }
  }

  const { error } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: user.id,
    content,
  });

  if (error) {
    console.error("[sendMessage] Üzenet mentési hiba:", error.message);
    return { error: "Az üzenet küldése sikertelen." };
  }

  console.log("[sendMessage] Üzenet mentve, értesítés küldése…", {
    conversationId,
    senderId: user.id,
  });

  const recipientId =
    conversation.client_id === user.id
      ? conversation.craftsman_id
      : conversation.client_id;

  const senderProfile = await getUserProfile(user.id);
  const senderName = senderProfile?.full_name ?? "Valaki";
  const appUrl = getAppBaseUrl();
  const chatPath =
    recipientId === conversation.client_id
      ? `/lakos/uzenetek/${conversationId}`
      : `/szaki/uzenetek/${conversationId}`;

  const preview =
    content.length > 120 ? `${content.slice(0, 117)}…` : content;

  try {
    const chatUrl = `${appUrl}${chatPath}`;
    const notifyResult = await notifyUser({
      userId: recipientId,
      title: "Új üzenet",
      body: `Új üzeneted érkezett tőle: ${senderName} – „${preview}"`,
      url: chatUrl,
      emailSubject: `Új üzenet – ${senderName}`,
      emailHtml: buildNewMessageEmailHtml({
        senderName,
        preview,
        chatUrl,
      }),
      tag: `chat-${conversationId}`,
    });

    console.log("[sendMessage] Értesítés eredménye:", notifyResult);

    if (!notifyResult.ok) {
      console.warn(
        "[sendMessage] Értesítés nem sikerült teljesen:",
        notifyResult.errors,
      );
    }
  } catch (notifyErr) {
    console.error("[sendMessage] Értesítés exception:", notifyErr);
  }

  revalidatePath("/lakos", "layout");
  revalidatePath("/szaki", "layout");
  revalidatePath(`/szaki/uzenetek/${conversationId}`);
  revalidatePath(`/lakos/uzenetek/${conversationId}`);
  revalidatePath("/szaki/uzenetek");
  revalidatePath("/lakos/uzenetek");
  return {};
}
