"use server";

import { revalidatePath } from "next/cache";
import { notifyUser } from "@/app/utils/notifications";
import { getAppBaseUrl } from "@/lib/stripe/config";
import { getSessionUser, getUserProfile } from "@/lib/auth/session";
import type {
  ContactActivationPollResult,
  ShareContactResult,
} from "@/lib/types/payments";
import { createClient } from "@/lib/supabase/server";

type ShareContactRpcResult = {
  success: boolean;
  outcome?: string;
  conversation_id?: string;
  bid_id?: string;
  job_id?: string;
  craftsman_id?: string;
  used_credit?: boolean;
  error?: string;
};

function mapRpcError(error: string | undefined): string {
  switch (error) {
    case "bid_not_found":
      return "Az ajánlat nem található.";
    case "job_not_found":
      return "A munka nem található.";
    case "unauthorized":
      return "Nincs jogosultságod ehhez az ajánlathoz.";
    case "job_closed":
      return "Ez a munka már lezárult vagy törölve lett.";
    case "bid_rejected":
      return "Ez az ajánlat el lett utasítva.";
    default:
      return "A kapcsolatmegosztás sikertelen.";
  }
}

async function sendCraftsmanActivationNotification(params: {
  craftsmanId: string;
  clientName: string;
  jobTitle: string;
  conversationId: string;
  bidId: string;
  paymentRequired: boolean;
}) {
  const appUrl = getAppBaseUrl();

  const title = params.paymentRequired
    ? "Új érdeklődő – fizetés szükséges a válaszhoz"
    : "Ajánlat elfogadva!";

  const body = params.paymentRequired
    ? `${params.clientName} megosztotta veled a kapcsolatot a(z) „${params.jobTitle}” munkánál. A válaszadáshoz egyszeri díj szükséges.`
    : `Gratulálunk! ${params.clientName} elfogadta az ajánlatodat, elindult a chat!`;

  try {
    const notifyResult = await notifyUser({
      userId: params.craftsmanId,
      title,
      body,
      url: `${appUrl}/szaki/uzenetek/${params.conversationId}`,
      emailSubject: `${title} – ${params.jobTitle}`,
      emailHtml: `<p>Szia!</p><p>${body}</p><p><a href="${appUrl}/szaki/uzenetek/${params.conversationId}">Chat megnyitása</a></p>`,
      tag: `bid-accepted-${params.bidId}`,
    });
    console.log("[shareContact] Értesítés eredménye:", notifyResult);
  } catch (notifyErr) {
    console.error("[shareContact] Értesítés exception:", notifyErr);
  }
}

function revalidateSharePaths(conversationId?: string) {
  revalidatePath("/lakos", "layout");
  revalidatePath("/szaki", "layout");
  revalidatePath("/lakos/ajanlatok");
  revalidatePath("/lakos/uzenetek");
  revalidatePath("/szaki/uzenetek");
  revalidatePath("/szaki/aktivitas");
  if (conversationId) {
    revalidatePath(`/lakos/uzenetek/${conversationId}`);
    revalidatePath(`/szaki/uzenetek/${conversationId}`);
  }
}

export async function initiateShareContact(
  bidId: string,
): Promise<ShareContactResult> {
  const user = await getSessionUser();
  if (!user) {
    return { ok: false, error: "Bejelentkezés szükséges." };
  }

  const profile = await getUserProfile(user.id);
  const clientName = profile?.full_name ?? "A megrendelő";
  const introMessage = `Szia! Köszönöm a pályázatod! ${clientName} tetszik az ajánlatod – mesélj még róla!`;

  const supabase = await createClient();

  console.log("[shareContact] RPC share_contact_with_credit indul", {
    bidId,
    clientId: user.id,
  });

  const { data, error } = await supabase.rpc("share_contact_with_credit", {
    p_bid_id: bidId,
    p_client_id: user.id,
    p_intro_message: introMessage,
  });

  if (error) {
    console.error("[shareContact] RPC hiba:", {
      bidId,
      message: error.message,
      code: error.code,
    });
    return { ok: false, error: mapRpcError(error.message) };
  }

  const result = data as ShareContactRpcResult;

  if (!result.success) {
    console.warn("[shareContact] RPC sikertelen:", { bidId, error: result.error });
    return { ok: false, error: mapRpcError(result.error) };
  }

  console.log("[shareContact] RPC eredmény:", result);

  const conversationId = result.conversation_id;
  if (!conversationId) {
    return { ok: false, error: "A chat indítása sikertelen." };
  }

  const { data: job } = await supabase
    .from("jobs")
    .select("title")
    .eq("id", result.job_id ?? "")
    .maybeSingle();

  if (
    result.craftsman_id &&
    (result.outcome === "activated" ||
      result.outcome === "craftsman_payment_required")
  ) {
    await sendCraftsmanActivationNotification({
      craftsmanId: result.craftsman_id,
      clientName,
      jobTitle: job?.title ?? "Munka",
      conversationId,
      bidId,
      paymentRequired: result.outcome === "craftsman_payment_required",
    });
  }

  revalidateSharePaths(conversationId);

  const outcome =
    result.outcome === "already_active"
      ? "already_active"
      : result.outcome === "craftsman_payment_required"
        ? "craftsman_payment_required"
        : "activated";

  return {
    ok: true,
    outcome,
    conversationId,
    craftsmanId: result.craftsman_id!,
    jobId: result.job_id!,
    usedCredit: result.used_credit,
  };
}

export async function pollContactActivation(
  bidId: string,
): Promise<ContactActivationPollResult> {
  const user = await getSessionUser();
  if (!user) {
    return { ok: false, error: "Bejelentkezés szükséges." };
  }

  const supabase = await createClient();

  const { data: bid, error } = await supabase
    .from("job_bids")
    .select("id, job_id, craftsman_id, contact_shared, status")
    .eq("id", bidId)
    .maybeSingle();

  if (error || !bid) {
    return { ok: false, error: "Az ajánlat nem található." };
  }

  const { data: job } = await supabase
    .from("jobs")
    .select("client_id")
    .eq("id", bid.job_id)
    .maybeSingle();

  if (!job || job.client_id !== user.id) {
    return { ok: false, error: "Nincs jogosultságod." };
  }

  if (!bid.contact_shared) {
    return { ok: true, contactShared: false, status: bid.status };
  }

  const { data: conversation } = await supabase
    .from("conversations")
    .select("id")
    .eq("job_id", bid.job_id)
    .eq("craftsman_id", bid.craftsman_id)
    .maybeSingle();

  if (!conversation) {
    return { ok: true, contactShared: false, status: bid.status };
  }

  return {
    ok: true,
    contactShared: true,
    conversationId: conversation.id,
  };
}
