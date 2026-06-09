import { notifyUser } from "@/app/utils/notifications";
import {
  buildBidAcceptedEmailHtml,
  buildChatUnlockedEmailHtml,
} from "@/lib/notification-templates";
import { getAppBaseUrl } from "@/lib/stripe/config";
import { createAdminClient } from "@/lib/supabase/admin";

type ActivationRpcResult = {
  success: boolean;
  outcome?: string;
  conversation_id?: string;
  job_id?: string;
  craftsman_id?: string;
  reason?: string;
  job_status?: string;
  error?: string;
};

export async function activateContactAfterPayment(params: {
  bidId: string;
  idempotencyKey: string;
  clientId: string;
  introMessage: string;
  metadata: Record<string, string>;
  clientName: string;
  jobTitle: string;
}): Promise<ActivationRpcResult> {
  const admin = createAdminClient();
  if (!admin) {
    console.error(
      "[stripe-webhook] SUPABASE_SERVICE_ROLE_KEY hiányzik – aktiválás sikertelen",
      { bidId: params.bidId },
    );
    throw new Error("Admin kliens nem elérhető.");
  }

  console.log("[stripe-webhook] activate_contact_after_payment RPC indul", {
    bidId: params.bidId,
    idempotencyKey: params.idempotencyKey,
    jobId: params.metadata.job_id,
    craftsmanId: params.metadata.craftsman_id,
  });

  const { data, error } = await admin.rpc("activate_contact_after_payment", {
    p_bid_id: params.bidId,
    p_idempotency_key: params.idempotencyKey,
    p_client_id: params.clientId,
    p_intro_message: params.introMessage,
    p_metadata: params.metadata,
  });

  if (error) {
    console.error("[stripe-webhook] RPC hiba:", {
      bidId: params.bidId,
      craftsmanId: params.metadata.craftsman_id,
      message: error.message,
      code: error.code,
    });
    throw error;
  }

  const result = data as ActivationRpcResult;

  if (result.outcome === "skipped_stale_job") {
    console.warn("[stripe-webhook] STALE JOB – fizetés érkezett, de a munka már nem elérhető", {
      bidId: params.bidId,
      jobId: params.metadata.job_id,
      craftsmanId: params.metadata.craftsman_id,
      reason: result.reason,
      jobStatus: result.job_status,
    });
    return result;
  }

  if (
    result.outcome === "activated" &&
    result.conversation_id &&
    result.craftsman_id
  ) {
    const appUrl = getAppBaseUrl();
    const isCraftsmanUnlock =
      params.metadata.payment_type === "craftsman_chat_unlock";
    const chatUrl = `${appUrl}/szaki/uzenetek/${result.conversation_id}`;

    try {
      const notifyResult = await notifyUser({
        userId: result.craftsman_id,
        title: isCraftsmanUnlock
          ? "Chat válaszadás aktiválva"
          : "Ajánlat elfogadva!",
        body: isCraftsmanUnlock
          ? `Sikeres fizetés – most már válaszolhatsz a(z) „${params.jobTitle}” munkához tartozó chatben.`
          : `Gratulálunk! ${params.clientName} elfogadta az ajánlatodat, elindult a chat!`,
        url: chatUrl,
        emailSubject: isCraftsmanUnlock
          ? `Chat aktiválva – ${params.jobTitle}`
          : `Ajánlat elfogadva – ${params.jobTitle}`,
        emailHtml: isCraftsmanUnlock
          ? buildChatUnlockedEmailHtml({
              jobTitle: params.jobTitle,
              chatUrl,
            })
          : buildBidAcceptedEmailHtml({
              clientName: params.clientName,
              jobTitle: params.jobTitle,
              chatUrl,
              paymentRequired: false,
            }),
        tag: `bid-accepted-${params.bidId}`,
      });
      console.log("[stripe-webhook] Értesítés eredménye:", notifyResult);
    } catch (notifyErr) {
      console.error("[stripe-webhook] Értesítés exception (nem blokkol):", notifyErr);
    }
  }

  console.log("[stripe-webhook] Aktiválás eredménye:", result);
  return result;
}
