"use server";

import { revalidatePath } from "next/cache";
import { notifyUser } from "@/app/utils/notifications";
import { buildBidRejectedEmailHtml } from "@/lib/notification-templates";
import { getAppBaseUrl } from "@/lib/stripe/config";
import { getSessionUser, getUserProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export async function rejectBid(bidId: string) {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("Bejelentkezés szükséges.");
  }

  const profile = await getUserProfile(user.id);
  const clientName = profile?.full_name ?? "A megrendelő";

  const supabase = await createClient();

  const { data: bid, error: bidError } = await supabase
    .from("job_bids")
    .select("id, job_id, craftsman_id, status, contact_shared")
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

  if (bid.status === "rejected") {
    return;
  }

  const { error: updateError } = await supabase
    .from("job_bids")
    .update({
      status: "rejected",
      activity_seen_by_craftsman_at: null,
    })
    .eq("id", bidId);

  if (updateError) {
    console.error("Elutasítás hiba:", updateError.message);
    throw new Error("Az elutasítás sikertelen.");
  }

  const appUrl = getAppBaseUrl();
  const activityUrl = `${appUrl}/szaki/aktivitas`;

  console.log("[rejectBid] Értesítés küldése a szakinak:", bid.craftsman_id);

  try {
    const notifyResult = await notifyUser({
      userId: bid.craftsman_id,
      title: "Pályázat elutasítva",
      body: `${clientName} elutasította a(z) „${job.title}” munkára adott ajánlatodat.`,
      url: activityUrl,
      emailSubject: `Pályázat elutasítva – ${job.title}`,
      emailHtml: buildBidRejectedEmailHtml({
        clientName,
        jobTitle: job.title,
        activityUrl,
      }),
      tag: `bid-rejected-${bidId}`,
    });

    console.log("[rejectBid] Értesítés eredménye:", notifyResult);

    if (!notifyResult.ok) {
      console.warn(
        "[rejectBid] Értesítés nem sikerült teljesen:",
        notifyResult.errors,
      );
    }
  } catch (notifyErr) {
    console.error("[rejectBid] Értesítés exception:", notifyErr);
  }

  revalidatePath("/lakos/ajanlatok");
  revalidatePath("/szaki/aktivitas");
  revalidatePath("/szaki", "layout");
}
