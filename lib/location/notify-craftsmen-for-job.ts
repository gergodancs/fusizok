import { after } from "next/server";
import { notifyUser } from "@/app/utils/notifications";
import { normalizeProfessions } from "@/lib/craftsman";
import { buildNewNearbyJobEmailHtml } from "@/lib/notification-templates";
import { formatJobLocation } from "@/lib/places";
import { getAppBaseUrl } from "@/lib/stripe/config";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Job } from "@/lib/types/job";

type NotifyJobPayload = Pick<
  Job,
  "id" | "title" | "category" | "county" | "city" | "zip_code" | "location_gps"
>;

export function scheduleNotifyMatchingCraftsmen(job: NotifyJobPayload): void {
  after(async () => {
    try {
      await notifyMatchingCraftsmenForJob(job);
    } catch (error) {
      console.error("[notify-job] Háttér értesítési hiba:", error);
    }
  });
}

export async function notifyMatchingCraftsmenForJob(
  job: NotifyJobPayload,
): Promise<void> {
  const admin = createAdminClient();
  if (!admin) {
    console.warn("[notify-job] Admin kliens hiányzik – értesítés kihagyva.");
    return;
  }

  const { data: craftsmen, error } = await admin
    .from("craftsman_profiles")
    .select("id, profession");

  if (error) {
    console.error("[notify-job] Fusizók lekérdezési hiba:", error.message);
    return;
  }

  const locationLabel = formatJobLocation(job);
  const jobUrl = `${getAppBaseUrl()}/szaki/palyaz/${job.id}`;

  for (const craftsman of craftsmen ?? []) {
    const professions = normalizeProfessions(craftsman.profession);
    if (!professions.includes(job.category)) {
      continue;
    }

    const { data: matches, error: matchError } = await admin.rpc(
      "job_matches_craftsman",
      {
        p_job_id: job.id,
        p_craftsman_id: craftsman.id,
      },
    );

    if (matchError) {
      console.error(
        "[notify-job] Illesztési RPC hiba:",
        craftsman.id,
        matchError.message,
      );
      continue;
    }

    if (!matches) {
      continue;
    }

    await notifyUser({
      userId: craftsman.id,
      title: "Új munka a közeledben",
      body: `${job.title} – ${locationLabel}`,
      url: `/szaki/palyaz/${job.id}`,
      emailSubject: `Új meló a közeledben: ${job.title}`,
      emailHtml: buildNewNearbyJobEmailHtml({
        jobTitle: job.title,
        locationLabel,
        category: job.category,
        jobUrl,
      }),
      tag: `nearby-job-${job.id}`,
    });
  }
}
