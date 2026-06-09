"use server";

import {
  isRequiredCompletionTime,
} from "@/lib/completion-time-options";
import { JOB_CATEGORIES, type JobCategory } from "@/lib/job-categories";
import type { JobFormDraft } from "@/lib/job-form-draft";
import { applyJobLocationGps } from "@/lib/location/gps-db";
import { parseLocationFromFormData } from "@/lib/location/parse-location-form";
import { uploadJobImages } from "@/lib/storage/upload-job-images";
import { createClient } from "@/lib/supabase/server";

export type JobFormState = {
  success?: boolean;
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
    return { error: "Kérjük, írja le részletesen a munkát.", draft };
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

  const payload: JobInsert =
    location.mode === "gps"
      ? {
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
        }
      : {
          client_id: user.id,
          title,
          description,
          category,
          county: location.county,
          city: location.city,
          zip_code: location.city,
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
    console.error("Beszúrandó adatok:", payload);
    return { error: "A mentés sikertelen. Kérjük, próbálja újra később.", draft };
  }

  await applyJobLocationGps(supabase, insertedJob.id, location);

  return { success: true };
}
