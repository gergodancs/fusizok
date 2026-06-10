"use server";

import { revalidatePath } from "next/cache";
import { isRequiredCompletionTime } from "@/lib/completion-time-options";
import { getSessionUser } from "@/lib/auth/session";
import { JOB_CATEGORIES, type JobCategory } from "@/lib/job-categories";
import type { JobFormDraft } from "@/lib/job-form-draft";
import { scheduleNotifyMatchingCraftsmen } from "@/lib/location/notify-craftsmen-for-job";
import { parseLocationFromFormData } from "@/lib/location/parse-location-form";
import { persistJobLocation } from "@/lib/location/persist-location";
import { isPioneerZoneForClientJob } from "@/lib/zone-activity";
import { uploadJobImages } from "@/lib/storage/upload-job-images";
import { createClient } from "@/lib/supabase/server";

export type JobFormState = {
  success?: boolean;
  pioneerZone?: boolean;
  error?: string;
  code?: "auth-required";
  draft?: JobFormDraft;
};

type JobInsert = {
  client_id: string;
  title: string;
  description: string;
  category: string;
  county: string | null;
  city: string | null;
  zip_code: string | null;
  status: "open";
  required_completion_time: string;
  image_urls: string[];
};

export async function createJob(
  _prevState: JobFormState,
  formData: FormData,
): Promise<JobFormState> {
  const title = (formData.get("title") as string)?.trim();
  const category = formData.get("category") as string;
  const description = (formData.get("description") as string)?.trim();
  const requiredCompletionTime = (
    formData.get("required_completion_time") as string
  )?.trim();
  const location = parseLocationFromFormData(formData);

  const draft: JobFormDraft = {
    title: title ?? "",
    category: category ?? "",
    locationMode: location?.mode ?? null,
    latitude: location?.mode === "gps" ? location.latitude : null,
    longitude: location?.mode === "gps" ? location.longitude : null,
    county: location?.mode === "manual" ? location.county : "",
    city: location?.mode === "manual" ? location.city : "",
    description: description ?? "",
    required_completion_time: requiredCompletionTime ?? "",
  };

  if (!title) {
    return { error: "Kérjük, adja meg a munka megnevezését.", draft };
  }

  if (!category || !JOB_CATEGORIES.includes(category as JobCategory)) {
    return { error: "Kérjük, válasszon szakma kategóriát.", draft };
  }

  if (!location) {
    return {
      error:
        "Kérjük, adja meg a helyszínt GPS-sel vagy válassza ki kézzel a megyét és települést.",
      draft,
    };
  }

  if (!description) {
    return { error: "Kérjük, írja le részetesen a munkát.", draft };
  }

  if (
    !requiredCompletionTime ||
    !isRequiredCompletionTime(requiredCompletionTime)
  ) {
    return {
      error: "Kérjük, válassza ki, mikorra szeretné az elvégzést.",
      draft,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      code: "auth-required",
      error: "A munkafeladáshoz bejelentkezés szükséges.",
      draft,
    };
  }

  const imageFiles = formData
    .getAll("images")
    .filter((f): f is File => f instanceof File && f.size > 0);

  const { urls: imageUrls, error: uploadError } = await uploadJobImages(
    imageFiles,
    user.id,
  );

  if (uploadError) {
    return { error: uploadError, draft };
  }

  const payload: JobInsert = {
    client_id: user.id,
    title,
    description,
    category,
    county: null,
    city: null,
    zip_code: null,
    status: "open",
    required_completion_time: requiredCompletionTime,
    image_urls: imageUrls,
  };

  const { data: insertedJob, error } = await supabase
    .from("jobs")
    .insert(payload)
    .select("id")
    .single();

  if (error || !insertedJob) {
    console.error("Supabase mentési hiba:", error);
    return { error: "A mentés sikertelen. Kérjük, próbálja újra később.", draft };
  }

  const resolved = await persistJobLocation(supabase, insertedJob.id, location);

  scheduleNotifyMatchingCraftsmen({
    id: insertedJob.id,
    title,
    category,
    county: resolved.county,
    city: resolved.city,
    zip_code: resolved.city,
    location_gps: resolved.latitude !== null ? true : null,
  });

  const pioneerZone = await isPioneerZoneForClientJob(resolved, user.id);

  return { success: true, pioneerZone };
}

export type JobMutationState = {
  success?: boolean;
  error?: string;
};

async function assertClientOwnsJob(
  jobId: string,
  allowedStatuses: Array<"open" | "assigned" | "completed" | "cancelled">,
) {
  const user = await getSessionUser();
  if (!user) {
    return { error: "Bejelentkezés szükséges." as const, user: null, job: null };
  }

  const supabase = await createClient();
  const { data: job, error } = await supabase
    .from("jobs")
    .select("id, client_id, status, title")
    .eq("id", jobId)
    .maybeSingle();

  if (error || !job) {
    return { error: "A hirdetés nem található." as const, user: null, job: null };
  }

  if (job.client_id !== user.id) {
    return {
      error: "Nincs jogosultságod ehhez a hirdetéshez." as const,
      user: null,
      job: null,
    };
  }

  if (!allowedStatuses.includes(job.status)) {
    return {
      error: "Ez a hirdetés már nem módosítható vagy törölhető." as const,
      user: null,
      job: null,
    };
  }

  return { error: null, user, job };
}

export async function updateJob(
  _prevState: JobMutationState,
  formData: FormData,
): Promise<JobMutationState> {
  const jobId = (formData.get("job_id") as string)?.trim();
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const location = parseLocationFromFormData(formData);

  if (!jobId) {
    return { error: "Hiányzó hirdetés azonosító." };
  }

  const ownership = await assertClientOwnsJob(jobId, ["open"]);
  if (ownership.error || !ownership.user) {
    return { error: ownership.error ?? "Ismeretlen hiba." };
  }

  if (!title) {
    return { error: "Kérjük, adja meg a munka megnevezését." };
  }

  if (!location) {
    return {
      error:
        "Kérjük, adja meg a helyszínt GPS-sel vagy válassza ki kézzel a megyét és települést.",
    };
  }

  if (!description) {
    return { error: "Kérjük, írja le részletesen a munkát." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("jobs")
    .update({
      title,
      description,
      county: null,
      city: null,
      zip_code: null,
    })
    .eq("id", jobId);

  if (error) {
    console.error("Hirdetés szerkesztési hiba:", error.message);
    return { error: "A mentés sikertelen. Kérjük, próbálja újra." };
  }

  await persistJobLocation(supabase, jobId, location);

  revalidatePath("/lakos/hirdeteseim");
  revalidatePath("/lakos");
  revalidatePath("/szaki");
  return { success: true };
}

export async function cancelJob(jobId: string): Promise<JobMutationState> {
  const ownership = await assertClientOwnsJob(jobId, ["open", "assigned"]);
  if (ownership.error) {
    return { error: ownership.error };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("jobs")
    .update({ status: "cancelled" })
    .eq("id", jobId);

  if (error) {
    console.error("Hirdetés törlési hiba:", error.message);
    return { error: "A törlés sikertelen. Kérjük, próbálja újra." };
  }

  revalidatePath("/lakos/hirdeteseim");
  revalidatePath("/lakos");
  revalidatePath("/lakos/ajanlatok");
  revalidatePath("/szaki");
  return { success: true };
}
