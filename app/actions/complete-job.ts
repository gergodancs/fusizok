"use server";

import { revalidatePath } from "next/cache";
import { notifyUser } from "@/app/utils/notifications";
import { getSessionUser, getUserProfile } from "@/lib/auth/session";
import { buildJobCompletedEmailHtml } from "@/lib/notification-templates";
import { getAppBaseUrl } from "@/lib/stripe/config";
import { createClient } from "@/lib/supabase/server";

export type CompleteJobState = {
  success?: boolean;
  error?: string;
};

export async function completeJob(
  jobId: string,
): Promise<CompleteJobState> {
  const user = await getSessionUser();
  if (!user) {
    return { error: "Bejelentkezés szükséges." };
  }

  const supabase = await createClient();

  const { data: job } = await supabase
    .from("jobs")
    .select("id, client_id, status, title")
    .eq("id", jobId)
    .maybeSingle();

  if (!job || job.client_id !== user.id) {
    return { error: "Nincs jogosultságod ehhez a munkához." };
  }

  if (job.status === "completed") {
    return { success: true };
  }

  if (job.status !== "open" && job.status !== "assigned") {
    return { error: "Ez a munka már lezárult." };
  }

  const { data: sharedBid } = await supabase
    .from("job_bids")
    .select("id, craftsman_id")
    .eq("job_id", jobId)
    .eq("contact_shared", true)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (!sharedBid) {
    return {
      error: "A munka csak aktív, megosztott kapcsolat után jelölhető késznek.",
    };
  }

  const { error } = await supabase
    .from("jobs")
    .update({ status: "completed" })
    .eq("id", jobId);

  if (error) {
    console.error("Munka lezárási hiba:", error.message);
    return { error: "A munka lezárása sikertelen." };
  }

  const clientProfile = await getUserProfile(user.id);
  const clientName = clientProfile?.full_name ?? "A megrendelő";
  const appUrl = getAppBaseUrl();
  const activityUrl = `${appUrl}/szaki/aktivitas`;

  try {
    await notifyUser({
      userId: sharedBid.craftsman_id,
      title: "Munka lezárva",
      body: `${clientName} késznek jelölte a(z) „${job.title}” munkát.`,
      url: activityUrl,
      emailSubject: `Munka lezárva – ${job.title}`,
      emailHtml: buildJobCompletedEmailHtml({
        clientName,
        jobTitle: job.title,
        activityUrl,
      }),
      tag: `job-completed-${jobId}`,
    });
  } catch (notifyErr) {
    console.error("[completeJob] Értesítés exception:", notifyErr);
  }

  revalidatePath("/lakos");
  revalidatePath("/lakos/uzenetek");
  revalidatePath("/szaki/uzenetek");
  revalidatePath("/szaki", "layout");
  return { success: true };
}
