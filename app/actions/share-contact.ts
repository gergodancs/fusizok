"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { notifyUser } from "@/app/utils/notifications";
import { getSessionUser, getUserProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export async function shareContact(bidId: string) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login?redirect=/lakos/ajanlatok");
  }

  const profile = await getUserProfile(user.id);
  const clientName = profile?.full_name ?? "A megrendelő";

  const supabase = await createClient();

  const { data: bid, error: bidError } = await supabase
    .from("job_bids")
    .select("id, job_id, craftsman_id, contact_shared")
    .eq("id", bidId)
    .maybeSingle();

  if (bidError || !bid) {
    throw new Error("Az ajánlat nem található.");
  }

  const { data: job } = await supabase
    .from("jobs")
    .select("id, client_id, title")
    .eq("id", bid.job_id)
    .maybeSingle();

  if (!job || job.client_id !== user.id) {
    throw new Error("Nincs jogosultságod ehhez az ajánlathoz.");
  }

  const { data: existingConversation } = await supabase
    .from("conversations")
    .select("id")
    .eq("job_id", job.id)
    .eq("craftsman_id", bid.craftsman_id)
    .maybeSingle();

  if (bid.contact_shared && existingConversation) {
    revalidatePath("/lakos", "layout");
    revalidatePath("/szaki", "layout");
    revalidatePath("/lakos/ajanlatok");
    revalidatePath("/lakos/uzenetek");
    redirect(`/lakos/uzenetek/${existingConversation.id}`);
  }

  const now = new Date().toISOString();
  const isFirstShare = !bid.contact_shared;

  if (isFirstShare) {
    const { error: updateError } = await supabase
      .from("job_bids")
      .update({
        contact_shared: true,
        contact_shared_at: now,
        status: "accepted",
      })
      .eq("id", bidId);

    if (updateError) {
      console.error("Kapcsolatmegosztás hiba:", updateError.message);
      throw new Error("A kapcsolatmegosztás sikertelen.");
    }
  }

  let conversationId = existingConversation?.id;

  if (!conversationId) {
    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .insert({
        job_id: job.id,
        client_id: job.client_id,
        craftsman_id: bid.craftsman_id,
      })
      .select("id")
      .single();

    if (convError || !conversation) {
      console.error("Beszélgetés létrehozási hiba:", convError?.message);
      throw new Error("A chat indítása sikertelen.");
    }

    conversationId = conversation.id;

    const introMessage = `Szia! ${clientName}-nek tetszik az ajánlatod, mondj róla többet!`;

    const { error: msgError } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content: introMessage,
    });

    if (msgError) {
      console.error("Üzenet küldési hiba:", msgError.message);
      throw new Error("Az üzenet küldése sikertelen.");
    }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (isFirstShare) {
    await notifyUser({
      userId: bid.craftsman_id,
      title: "Ajánlat elfogadva!",
      body: `Gratulálunk! ${clientName} elfogadta az ajánlatodat, elindult a chat!`,
      url: `${appUrl}/szaki/uzenetek/${conversationId}`,
      emailSubject: `Ajánlat elfogadva – ${job.title}`,
      emailHtml: `<p>Szia!</p><p><strong>Gratulálunk!</strong> ${clientName} elfogadta az ajánlatodat a(z) <strong>${job.title}</strong> munkára, és elindult a chat!</p><p><a href="${appUrl}/szaki/uzenetek/${conversationId}">Chat megnyitása</a></p>`,
      tag: `bid-accepted-${bidId}`,
    });
  }

  revalidatePath("/lakos", "layout");
  revalidatePath("/szaki", "layout");
  revalidatePath("/lakos/ajanlatok");
  revalidatePath("/lakos/uzenetek");
  revalidatePath("/szaki/uzenetek");
  revalidatePath("/szaki/aktivitas");
  revalidatePath(`/lakos/uzenetek/${conversationId}`);

  redirect(`/lakos/uzenetek/${conversationId}`);
}
