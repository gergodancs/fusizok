"use server";

import { revalidatePath } from "next/cache";
import { isAvailabilityDuration } from "@/lib/availability-options";
import { notifyUser } from "@/app/utils/notifications";
import { getSessionUser, getUserProfile } from "@/lib/auth/session";
import { BID_CREDIT_COST } from "@/lib/credits/constants";
import { buildNewBidEmailHtml } from "@/lib/notification-templates";
import { getAppBaseUrl } from "@/lib/stripe/config";
import { createClient } from "@/lib/supabase/server";

export type BidFormState = {
  success?: boolean;
  error?: string;
  insufficientCredits?: boolean;
};

type SubmitBidRpcResult = {
  success: boolean;
  error?: string;
  bid_id?: string;
  credits_remaining?: number;
};

function mapBidRpcError(error: string | undefined): string {
  switch (error) {
    case "job_unavailable":
      return "A munka nem elérhető pályázásra.";
    case "already_applied":
      return "Erre a munkára már pályáztál.";
    case "missing_availability":
      return "Kérjük, válassz vállalási időt.";
    case "unauthorized":
    case "not_craftsman":
      return "Nincs jogosultságod pályázni.";
    case "insufficient_credits":
      return "Nincs elég kredited a pályázathoz! Töltsd fel az egyenleged a továbblépéshez.";
    default:
      return "A pályázat mentése sikertelen.";
  }
}

export async function createJobBid(
  _prevState: BidFormState,
  formData: FormData,
): Promise<BidFormState> {
  const user = await getSessionUser();
  if (!user) {
    return { error: "Bejelentkezés szükséges." };
  }

  const jobId = formData.get("job_id") as string;
  const priceRaw = (formData.get("price") as string)?.trim();
  const message = (formData.get("message") as string)?.trim() || null;
  const availability = (formData.get("availability_duration") as string)?.trim();

  if (!jobId) {
    return { error: "Hiányzó munka azonosító." };
  }

  if (!availability || !isAvailabilityDuration(availability)) {
    return { error: "Kérjük, válassz vállalási időt." };
  }

  let price: number | null = null;
  if (priceRaw) {
    const parsed = Number(priceRaw);
    if (Number.isNaN(parsed) || parsed < 0) {
      return { error: "Adj meg érvényes árat (Ft), vagy hagyd üresen." };
    }
    price = parsed;
  }

  const supabase = await createClient();

  const { data, error } = await supabase.rpc("submit_job_bid_with_credits", {
    p_craftsman_id: user.id,
    p_job_id: jobId,
    p_price: price,
    p_message: message,
    p_availability_duration: availability,
    p_credit_cost: BID_CREDIT_COST,
  });

  if (error) {
    console.error("[createJobBid] RPC hiba:", error.message);
    return { error: "A pályázat mentése sikertelen." };
  }

  const result = data as SubmitBidRpcResult;

  if (!result.success) {
    if (result.error === "insufficient_credits") {
      return {
        error: mapBidRpcError(result.error),
        insufficientCredits: true,
      };
    }
    return { error: mapBidRpcError(result.error) };
  }

  const { data: job } = await supabase
    .from("jobs")
    .select("client_id, title")
    .eq("id", jobId)
    .maybeSingle();

  if (job) {
    const craftsmanProfile = await getUserProfile(user.id);
    const craftsmanName = craftsmanProfile?.full_name ?? "Egy fusizó";
    const appUrl = getAppBaseUrl();
    const offersUrl = `${appUrl}/lakos/ajanlatok`;

    try {
      await notifyUser({
        userId: job.client_id,
        title: "Új pályázat",
        body: `${craftsmanName} pályázott a(z) „${job.title}” munkádra.`,
        url: offersUrl,
        emailSubject: `Új pályázat – ${job.title}`,
        emailHtml: buildNewBidEmailHtml({
          craftsmanName,
          jobTitle: job.title,
          offersUrl,
        }),
        tag: `new-bid-${jobId}`,
      });
    } catch (notifyErr) {
      console.error("[createJobBid] Értesítés exception:", notifyErr);
    }
  }

  revalidatePath("/szaki", "layout");
  revalidatePath("/szaki/aktivitas");
  revalidatePath("/szaki/kreditek");
  revalidatePath("/lakos/ajanlatok", "layout");

  return { success: true };
}
